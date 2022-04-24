import { Metadata } from '@grpc/grpc-js'
import { Controller, Post, Inject, OnModuleInit, Body, Get } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { EventService, EventServiceName, CreateEventRequest, MyEventsRequest } from 'proto-npm'
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
    createEvent(@Meta() metadata: Metadata, @Body() eventData: CreateEventRequest) {
        return this.eventService.createEvent(eventData, metadata)
    }

    @Post('my-created-events')
    myCreatedEvents(@Meta() metadata: Metadata, @Body() req: MyEventsRequest) {
        return this.eventService.myCreatedEvents(req, metadata)
    }

    @Get('all-events')
    allEvents(@Meta() metadata: Metadata) {
        return this.eventService.allEvents({}, metadata)
    }
}
