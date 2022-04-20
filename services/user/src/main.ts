import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Transport } from '@nestjs/microservices'
import { UserServiceName, UserServicePath } from 'proto-npm'

const logger = new Logger('Main')

const microserviceOptions = {
  transport: Transport.GRPC,
  options: {
    package: UserServiceName,
    protoPath: UserServicePath
    // url: 'localhost:50051'
  }
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, microserviceOptions)
  await app.listen()
  logger.verbose('User service is listening...')
}

bootstrap()
