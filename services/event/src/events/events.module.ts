import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'
import { Event, EventSchema } from 'schemas/event.schema'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'
import { BlockchainServiceName, BlockchainServicePath, UserServiceName, UserServicePath } from 'proto-npm'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')
      })
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET')
      })
    }),
    ClientsModule.register([
      {
        name: BlockchainServiceName,
        transport: Transport.GRPC,
        options: {
            package: BlockchainServiceName,
            protoPath: BlockchainServicePath,
            url: 'localhost:50051'
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
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])
  ],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}
