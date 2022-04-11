import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Transport } from '@nestjs/microservices'
import { BlockchainServiceName, BlockchainServicePath } from 'proto-npm'

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
  console.log(BlockchainServicePath)
  const app = await NestFactory.createMicroservice(AppModule, microserviceOptions)
  await app.listen()
  logger.log('Blockchain service is listening...')
}

bootstrap()
