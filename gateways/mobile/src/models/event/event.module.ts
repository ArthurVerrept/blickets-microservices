import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { EventController } from './event.controller'
import { EventServiceName, EventServicePath } from '@arthurverrept/proto-npm'
import { credentials } from '@grpc/grpc-js'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: EventServiceName,
                transport: Transport.GRPC,
                options: {
                    package: EventServiceName,
                    protoPath: EventServicePath,
                    url: 'event-3jjrtrh3ha-ew.a.run.app:443',
                    credentials: credentials.createSsl()
                }
            }
        ]),
        ConfigModule
    ],
    controllers: [EventController]
})
export class EventModule {}
