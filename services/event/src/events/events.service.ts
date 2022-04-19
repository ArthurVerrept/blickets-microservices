import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Event, EventDocument } from 'schemas/event.schema'

@Injectable()
export class EventsService {
    constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

    async createEvent(eventData): Promise<Event> {
      console.log(eventData)
        // const createdEvent = new this.eventModel(eventData)
        // return createdEvent.save()
      }
}
