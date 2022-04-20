import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { EthereumController } from './ethereum.controller'
import { EthereumService } from './ethereum.service'
import { EventServiceName, EventServicePath } from 'proto-npm'

@Module({
  imports:[
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET')
      })
    }),
    ClientsModule.register([
      {
        name: EventServiceName,
        transport: Transport.GRPC,
        options: {
            package: EventServiceName,
            protoPath: EventServicePath,
            url: 'localhost:50052'
        }
      }
    ])
  ],
  controllers: [EthereumController],
  providers: [EthereumService]
})
export class EthereumModule {}
