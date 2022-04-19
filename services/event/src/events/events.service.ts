import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Event, EventDocument } from 'schemas/event.schema'

@Injectable()
export class EventsService {
    constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

    async createEvent(eventData, metadata) {
        const createdEvent = new this.eventModel({
          ...eventData,
          userId: metadata.getMap().user.id
        })
        const newEvent = await createdEvent.save()
        // console.log(newEvent._id.toString())
        return {}
      }
}
