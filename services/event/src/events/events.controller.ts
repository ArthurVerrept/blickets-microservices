import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcAuthGuard } from 'src/grpcAuthGuard.strategy'
import { EventsService } from './events.service'
import { CreateEventRequest, UpdateEventRequest } from 'proto-npm'
import { Metadata } from '@grpc/grpc-js'

@Controller('events')
export class EventsController {
    constructor(private eventService: EventsService) {}
    
    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('EventService', 'CreateEvent')
    createAccount(eventData: CreateEventRequest, metadata: Metadata) {
        return this.eventService.createEvent(eventData, metadata)
    }

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('EventService', 'MyCreatedEvents')
    myCreatedEvents(_, metadata: Metadata) {
        console.log('in?')
        return this.eventService.myCreatedEvents(metadata)
    }

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('EventService', 'UpdateEventStatus')
    updateEventStatus(req: UpdateEventRequest) {
        return this.eventService.updateEventStatus(req)
    }
}
