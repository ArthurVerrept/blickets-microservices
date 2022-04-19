import { Metadata } from '@grpc/grpc-js'
import { Controller, Post, Inject, OnModuleInit, Body } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { EventService, EventServiceName, CreateEventRequest } from 'proto-npm'
import { Meta } from 'src/common/decorators/meta.decorator'

@Controller('event')
export class EventController implements OnModuleInit {
    private eventService: EventService
    
    constructor(
        @Inject(EventServiceName) private client: ClientGrpc,
    ) {}
        
    onModuleInit(): void {
        this.eventService = this.client.getService<EventService>('EventService')
    }
    
    @Post('create-event')
    createEvent(@Meta() metadata: Metadata, @Body() eventData) {
        return this.eventService.createEvent(eventData, metadata)
    }
}
