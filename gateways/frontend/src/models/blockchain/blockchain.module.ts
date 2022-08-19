import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { BlockchainController } from './blockchain.controller'
import { BlockchainServiceName, BlockchainServicePath } from '@arthurverrept/proto-npm'
import { ConfigModule } from '@nestjs/config'
@Module({
  imports: [
    ClientsModule.register([
      {
        name: BlockchainServiceName,
        transport: Transport.GRPC,
        options: {
            package: BlockchainServiceName,
            protoPath: BlockchainServicePath,
            url: 'localhost:50051'
        }
      }
    ]),
    ConfigModule
  ],
  controllers: [BlockchainController],
  providers: []
})
export class BlockchainModule {}
