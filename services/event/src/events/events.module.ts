import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'
import { Event, EventSchema } from '../schemas/event.schema'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'
import { BlockchainServiceName, BlockchainServicePath, UserServiceName, UserServicePath } from '@arthurverrept/proto-npm'
import { UserEvent, UserEventSchema } from '../schemas/userEvent.schema'
import { Keys, KeysSchema } from '../schemas/keys.schema'
import { TicketsScanned, TicketsScannedSchema } from '../schemas/ticketsScanned.schama'
import { credentials } from '@grpc/grpc-js'

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
            url: 'blockchain-3jjrtrh3ha-ew.a.run.app:443',
            credentials: credentials.createSsl()
        }
      },
      {
        name: UserServiceName,
        transport: Transport.GRPC,
        options: {
            package: UserServiceName,
            protoPath: UserServicePath,
            url: 'user-3jjrtrh3ha-ew.a.run.app:443',
            credentials: credentials.createSsl()
        }
      }
    ]),
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema }, 
      { name: UserEvent.name, schema: UserEventSchema },  
      { name: Keys.name, schema: KeysSchema },
      { name: TicketsScanned.name, schema: TicketsScannedSchema }
    ])
  ],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}
