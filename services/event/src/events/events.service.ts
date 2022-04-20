import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Event, EventDocument } from 'schemas/event.schema'
import { UpdateEventRequest } from 'proto-npm'
import { status } from '@grpc/grpc-js'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  async createEvent(eventData, metadata) {
      const createdEvent = new this.eventModel({
        ...eventData,
        userId: metadata.getMap().user.id,
        createdTime: new Date()
      })

      await createdEvent.save()
      return {}
  }

  async getEvents(metadata) {
    const events = await this.eventModel.find({userId: metadata.getMap().user.id}).select('-_id -__v -createdTime').exec()

    return { events }
  }

  async updateEventStatus(req: UpdateEventRequest) {
    if(req.txHash){
      await this.eventModel.findOneAndUpdate({ txHash: req.txHash }, {contractAddress: req.contractAddress, deployedStatus: 'success' })
    }

    return {}
  }
}
