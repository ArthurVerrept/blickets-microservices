import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Transport } from '@nestjs/microservices'
import { BlockchainServiceName, BlockchainServicePath } from '@arthurverrept/proto-npm'
import { HttpErrorIntercept } from './common/interceptors/httpError.interceptor'

const address = process.env.PORT ? `0.0.0.0:${process.env.PORT}` : 'localhost:50051'

const logger = new Logger('Main')

const microserviceOptions = {
  transport: Transport.GRPC,
  options: {
    package: BlockchainServiceName,
    protoPath: BlockchainServicePath,
    url: address
  }
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, microserviceOptions)
  app.useGlobalInterceptors(new HttpErrorIntercept())
  await app.listen()
  logger.verbose('Blockchain service is listening...')
}

bootstrap()
