import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Event, EventSchema } from 'schemas/event.schema'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')
      })
    }),
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])
  ],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}
