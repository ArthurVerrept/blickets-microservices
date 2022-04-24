import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { status } from '@grpc/grpc-js'
import { Model } from 'mongoose'
import { Event, EventDocument } from 'schemas/event.schema'
import { UpdateEventRequest, BlockchainServiceName, BlockchainService, UserServiceName, UserService } from 'proto-npm'
import { ClientGrpc, RpcException } from '@nestjs/microservices'
import { Metadata } from '@grpc/grpc-js'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class EventsService implements OnModuleInit {
  private blockchainService: BlockchainService
  private userService: UserService

      
  onModuleInit(): void {
      // this.blockchainService = this.blockchainClient.getService<BlockchainService>('BlockchainService')
      this.userService = this.client.getService<UserService>('UserService')
  }


  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    // @Inject(BlockchainServiceName) private blockchainClient: ClientGrpc,
    @Inject(UserServiceName) private client: ClientGrpc
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

  async myCreatedEvents(userAddress, metadata) {
    const addresses$ = this.userService.myAddresses({}, metadata)
    const addressRes = await lastValueFrom(addresses$)
    if (!addressRes.addresses.includes(userAddress)){
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Address not owned by account'
      })
    }

    const events = await this.eventModel.find({userId: metadata.getMap().user.id, deployerAddress: userAddress}).select('-_id -__v -createdTime').exec()
    
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


  async allEvents(metadata: Metadata) {
    const events = await this.eventModel.find({ deployedStatus: 'success' }).select(('-_id -__v -createdTime -userId -txHash -deployedStatus')).exec()

    const returnEvents = []
    for(const event of events) {
      const price$ = this.blockchainService.eventDisplayDetails({contractAddress: event.contractAddress}, metadata)
      const price = await lastValueFrom(price$)

      returnEvents.push({ 
        eventDate: event.eventDate, 
        contractAddress: event.contractAddress, 
        imageUrl: event.imageUrl, 
        symbol: event.symbol, 
        eventName: event.eventName, 
        ticketPrice: price.ticketPrice, 
        ticketAmount: price.ticketAmount, 
        ticketIdCounter: price.ticketIdCounter
      })
    }

    return { events: returnEvents }
  }

  async eventByContractAddress(contractAddress: string, metadata: Metadata) {
    const [event] = await this.eventModel.find({ contractAddress }).select(('-_id -__v -createdTime -userId -txHash -deployedStatus')).exec()

      const price$ = this.blockchainService.eventDisplayDetails({contractAddress: event.contractAddress}, metadata)
      const price = await lastValueFrom(price$)

      const returnEvent = { 
        eventDate: event.eventDate, 
        contractAddress: event.contractAddress, 
        imageUrl: event.imageUrl, 
        symbol: event.symbol, 
        eventName: event.eventName, 
        ticketPrice: price.ticketPrice, 
        ticketAmount: price.ticketAmount, 
        ticketIdCounter: price.ticketIdCounter
      }

    return returnEvent
  }


}
