import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Transport } from '@nestjs/microservices'
import { BlockchainServiceName, BlockchainServicePath } from 'proto-npm'
import { HttpErrorIntercept } from './common/interceptors/httpError.interceptor'

const logger = new Logger('Main')

const microserviceOptions = {
  transport: Transport.GRPC,
  options: {
    package: BlockchainServiceName,
    protoPath: BlockchainServicePath,
    url: 'localhost:50051'
  }
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, microserviceOptions)
  app.useGlobalInterceptors(new HttpErrorIntercept())
  await app.listen()
  logger.verbose('Blockchain service is listening...')
}

bootstrap()
