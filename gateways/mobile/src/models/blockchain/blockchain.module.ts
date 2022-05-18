import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { BlockchainController } from './blockchain.controller'
import { BlockchainServiceName, BlockchainServicePath } from '@arthurverrept/proto-npm'
import { ConfigModule } from '@nestjs/config'
import { credentials } from '@grpc/grpc-js'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: BlockchainServiceName,
        transport: Transport.GRPC,
        options: {
            package: BlockchainServiceName,
            protoPath: BlockchainServicePath,
            url: 'blockchain-3jjrtrh3ha-ew.a.run.app:443',
            credentials: credentials.createSsl()
        }
      }
    ]),
    ConfigModule
  ],
  controllers: [BlockchainController],
  providers: []
})
export class BlockchainModule {}
