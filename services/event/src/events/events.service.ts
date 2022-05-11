import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { status } from '@grpc/grpc-js'
import { Model } from 'mongoose'
import { Event, EventDocument } from 'schemas/event.schema'
import { UserEvent, UserEventDocument } from 'schemas/userEvent.schema'
import { UpdateEventRequest, BlockchainServiceName, BlockchainService, UserServiceName, UserService } from 'proto-npm'
import { ClientGrpc, RpcException } from '@nestjs/microservices'
import { Metadata } from '@grpc/grpc-js'
import { lastValueFrom } from 'rxjs'
import { Keys, KeysDocument } from 'schemas/keys.schema'
import { JwtService } from '@nestjs/jwt'
import { TicketsScanned, TicketsScannedDocument } from 'schemas/ticketsScanned.schama'


@Injectable()
export class EventsService implements OnModuleInit {
  private blockchainService: BlockchainService
  private userService: UserService

  onModuleInit(): void {
      this.blockchainService = this.blockchainClient.getService<BlockchainService>('BlockchainService')
      this.userService = this.userClient.getService<UserService>('UserService')
  }


  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(UserEvent.name) private userEventModel: Model<UserEventDocument>,
    @InjectModel(Keys.name) private keysModel: Model<KeysDocument>,
    @InjectModel(TicketsScanned.name) private ticketsScannedModel: Model<TicketsScannedDocument>,
    @Inject(BlockchainServiceName) private blockchainClient: ClientGrpc,
    @Inject(UserServiceName) private userClient: ClientGrpc,
    private readonly jwtService: JwtService, 
  ) {}

  async createEvent(eventData, metadata) {
      const createdEvent = new this.eventModel({
        ...eventData,
        userId: metadata.getMap().user.id,
        admins: [metadata.getMap().user.id.toString()],
        createdTime: new Date()
      })

      await createdEvent.save()
      return {}
  }

  async myCreatedEvents(userAddress, metadata) {
    await this.doesUserOwnAddress(userAddress, metadata)

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

  async createUserEvent(req, metadata) {
    const userEvent = await this.userEventModel.findOne({ userId: metadata.getMap().user.id, walletAddress: req.walletAddress })
    // if user has no events create array for his events
    if (!userEvent) {
      const userEvent = new this.userEventModel({
        userId: metadata.getMap().user.id,
        walletAddress: req.walletAddress,
        contractAddress: [req.contractAddress]
      })
      await userEvent.save()
    // else add to his events the contract address of the event if it not present 
    } else {
      await this.userEventModel.findOneAndUpdate({ userId: metadata.getMap().user.id, walletAddress: req.walletAddress }, { $addToSet: { contractAddress: req.contractAddress } })
    }
  }

  async deleteUserEvent(req, metadata) {
    const userEvent = await this.userEventModel.findOne({ userId: metadata.getMap().user.id })
    if (!userEvent) {

    } else {
      // find and remove contract address from array
      await this.userEventModel.findOneAndUpdate({ userId: metadata.getMap().user.id, walletAddress: req.walletAddress }, { $pull: { contractAddress: req.contractAddress } })
    }
  }

  async allUserEvents(req, metadata) {
    const userEvent = await this.userEventModel.findOne({userId: metadata.getMap().user.id, walletAddress: req.walletAddress})
    if(!userEvent) {
      return {}
    }
    return { contractAddresses: userEvent.contractAddress }
  }

  async eventInfo(req, metadata) {
    // check userId owns this address
    await this.doesUserOwnAddress(req.address, metadata)

    // get event info from mongodb
    const event = await this.eventModel.findOne({ userId: metadata.getMap().user.id, deployerAddress: req.address, contractAddress: req.contractAddress }).select('-_id -__v -userId')

    // get event info from blockchain service
    const blockchainEventInfo$ = this.blockchainService.blockchainEventInfo({contractAddress: req.contractAddress}, metadata)
    const blockchainEventInfo = await lastValueFrom(blockchainEventInfo$)

    // get admin info from user service 
    const admins$ = this.userService.adminEmails({adminIds: event.admins}, metadata)
    const admins = await lastValueFrom(admins$)
    return {
      eventName: event.eventName,
      symbol: event.symbol,
      imageUrl: event.imageUrl,
      txHash: event.txHash,
      deployedStatus: event.deployedStatus,
      createdTime: event.createdTime.getTime().toString(),
      eventDate: event.eventDate,
      deployerAddress: event.deployerAddress,
      admins: admins.admins,
      currentBalance: blockchainEventInfo.currentBalance,
      ticketAmount: blockchainEventInfo.ticketAmount,
      ticketsSold: blockchainEventInfo.ticketsSold,
      ticketPrice: blockchainEventInfo.ticketPrice
    }
  }

  async masterKey(req, metadata){
    // check userId from JWT owns address being sent
    await this.doesUserOwnAddress(req.address, metadata)

    // check if address in question owns any tickets to event
    const isOwner$ = this.blockchainService.doesAddressOwnTicket({contractAddress: req.contractAddress, address: req.address}, metadata)
    const isOwner = await lastValueFrom(isOwner$)

    if(!isOwner.result) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Address must own NFT of event'
      })
    }

    // return masterkey
    const keys = await this.keysModel.findOne({keysId:0})

    return keys
  }

  async validateQr(req, metadata){
    // check if userId of person sending this request is an admin on this event
    const event = await this.eventModel.findOne({ contractAddress: req.contractAddress })

    // WORKS
    if(!event.admins.includes(metadata.getMap().user.id.toString())){
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Request must come from an admin of this event'
      })
    }

    const newUserMetadata = new Metadata()
    try {
      // decode JWT to check if valid 
      // WORKS
      this.jwtService.verify(req.accessToken)
      
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // create new metadata object on behalf of user who's ticket you are checking
      newUserMetadata.set('Authorization', 'Bearer ' + req.accessToken) 
    } catch (e) {
      // Error if token is expired, this block old accessTokens
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Token used for barcode has expired'
      })
    }

    // check user owns address being sent
    await this.doesUserOwnAddress(req.address, newUserMetadata)

    // call blockchain service check if account owns this ticket
    await this.doesAddressOwnTicket(req.contractAddress, req.address, metadata)

    // get eventCheckIn
    const ticketsScanned = await this.ticketsScannedModel.findOneAndUpdate({ contractAddress: req.contractAddress }, { $set: { contractAddress: req.contractAddress }}, { upsert: true  })

    // check this ticketId has not already been used
    if(ticketsScanned.tokenIds.includes(req.ticketId)) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Ticket has already been used'
      })
    } else {
      // otherwise add the ticket to the tokenIds array
      ticketsScanned.tokenIds.push(req.ticketId)
      try {
        // save changes to db
        await ticketsScanned.save()
      } catch (error) {
        // if failed error and scan again
        throw new RpcException({
          code: status.ABORTED,
          message: 'Adding ticket failed please scan again'
        })
      }
    }
    
    // add this ticketId to an entry that is keyed by the contract address of the event

  }

  async addAdmin(req, metadata) {
    // check user owns address being sent in
    await this.doesUserOwnAddress(req.address, metadata)

    // get event to add admins to
    const event = await this.eventModel.findOne({contractAddress: req.contractAddress})

    // check address of sender is deployer address
    if(event.deployerAddress !== req.address) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Address being used to add admin must be event deployer address'
      })
    }

    // check userId of sender is the same as userId of deployer
    if(event.userId !== metadata.getMap().user.id.toString()) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'User making request must event deployer'
      })
    }

    // get userId as string from user service
    // will return error if no user is found by email
    const res$ = this.userService.adminId({ email: req.email }, metadata)
    const res = await lastValueFrom(res$)

    if(event.admins.includes(res.adminId)) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Admin has already been added'
      })
    }
    event.admins.push(res.adminId)
    event.save()

    return {}
  }

  async doesUserOwnAddress(address: string, metadata){
    const addresses$ = this.userService.myAddresses({}, metadata)
    const addressRes = await lastValueFrom(addresses$)

    if(!addressRes.addresses.includes(address)){ 
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'User must own address in request'
      })
    }
  }


  async doesAddressOwnTicket(contractAddress: string, address: string, metadata){
    const isOwner$ = this.blockchainService.doesAddressOwnTicket({contractAddress: contractAddress, address: address}, metadata)
    const isOwner = await lastValueFrom(isOwner$)

    if(!isOwner.result) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Address must own NFT of event'
      })
    }
  }
}
