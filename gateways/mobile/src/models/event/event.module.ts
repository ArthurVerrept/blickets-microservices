import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { EventController } from './event.controller'
import { EventServiceName, EventServicePath } from 'proto-npm'

@Module({
    imports: [
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
        ]),
        ConfigModule
    ],
    controllers: [EventController]
})
export class EventModule {}
