import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcAuthGuard } from 'src/grpcAuthGuard.strategy'
import { EventsService } from './events.service'
import { CreateEventRequest, UpdateEventRequest, EventByContractRequest, MyEventsRequest } from 'proto-npm'
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
    myCreatedEvents(req: MyEventsRequest, metadata: Metadata) {
        return this.eventService.myCreatedEvents(req.address, metadata)
    }

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('EventService', 'UpdateEventStatus')
    updateEventStatus(req: UpdateEventRequest) {
        return this.eventService.updateEventStatus(req)
    }

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('EventService', 'AllEvents')
    allEvents(_, metadata: Metadata) {
        return this.eventService.allEvents(metadata)
    }

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('EventService', 'EventByContractAddress')
    oneEvent(req: EventByContractRequest, metadata: Metadata) {
        return this.eventService.eventByContractAddress(req.contractAddress, metadata)
    }
}
