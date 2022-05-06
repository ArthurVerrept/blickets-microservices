import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { EthereumController } from './ethereum.controller'
import { EthereumService } from './ethereum.service'
import { EventServiceName, EventServicePath, UserServiceName, UserServicePath } from 'proto-npm'
import { HttpModule } from '@nestjs/axios'

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
      },
      {
        name: UserServiceName,
        transport: Transport.GRPC,
        options: {
            package: UserServiceName,
            protoPath: UserServicePath
        }
      }
    ]),
    HttpModule
  ],
  controllers: [EthereumController],
  providers: [EthereumService]
})
export class EthereumModule {}
