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
          userId: metadata.getMap().user.id,
          createdTime: new Date()
        })
        // console.log(createdEvent)

        // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        // createdEvent = {
        //   userId: createdEvent.userId,
        //   cid: createdEvent.cid,
        //   contractAddress: createdEvent.contractAddress,
        //   txHash: createdEvent.txHash,
        //   deployedStatus: createdEvent.deployedStatus,
        //   eventDate: createdEvent.eventDate,
        //   _id: createdEvent._id
        // }
        // console.log(newEvent._id.toString())
        await createdEvent.save()
        return {}
    }

    async getEvents(metadata) {
      const events = await this.eventModel.find({userId: metadata.getMap().user.id}).select('-_id -__v -createdTime').exec()
      // events.forEach(event => {
      //   if(event.admins === []){
      //     event = {
            
      //     }
      //   }
      // })
      console.log(events)

      return { events }
  }
}
