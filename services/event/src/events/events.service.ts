import { HttpException, Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Event, EventDocument } from 'schemas/event.schema'
import { UpdateEventRequest, BlockchainServiceName, BlockchainService } from 'proto-npm'
import { ClientGrpc, RpcException } from '@nestjs/microservices'

@Injectable()
export class EventsService implements OnModuleInit {
  private blockchainService: BlockchainService

      
  onModuleInit(): void {
      this.blockchainService = this.client.getService<BlockchainService>('BlockchainService')
  }


  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @Inject(BlockchainServiceName) private client: ClientGrpc
  ) {}

  async createEvent(eventData, metadata) {
      const createdEvent = new this.eventModel({
        ...eventData,
        userId: metadata.getMap().user.id,
        createdTime: new Date()
      })

      await createdEvent.save()
      return {}
  }

  async myCreatedEvents(metadata) {
    const events = await this.eventModel.find({userId: metadata.getMap().user.id}).select('-_id -__v -createdTime').exec()

    return { events }
  }

  async updateEventStatus(req: UpdateEventRequest) {
    let update = { } 

    if(req.contractAddress){
      update = { contractAddress: req.contractAddress, deployedStatus: 'success' }
    } else {
      update = { deployedStatus: 'failed' }
    }
    await this.eventModel.findOneAndUpdate({ txHash: req.txHash }, update)

    return {}
  }
}
