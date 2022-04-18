import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcAuthGuard } from '../grpcAuthGuard.strategy'
import { EthereumService } from './ethereum.service'
import { UploadImageRequest, CreateEventRequest } from 'proto-npm'
import { ConfigService } from '@nestjs/config'

@Controller('ethereum')
export class EthereumController {
    constructor(private ethereumService: EthereumService, private configService: ConfigService) {}

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'CreateEthereumAccount')
    createAccount() {
        return this.ethereumService.createEthereumAccount()
    }

    // @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'GetEvents')
    async getEvents() {
       return this.ethereumService.getDeployedEvents()
    }

    // @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'CreateEvent')
    async createEvent(eventData: CreateEventRequest) {
        // get image and data

        // upload image to ipfs saving CID just in memory here

        // create transaction object with encoded createEvent method as data field
        const data = await this.ethereumService.createTransactionData(eventData)
        return data
        // save txnId to db event with created event with deployed_status as "pending" and CID as metadata link
        // send transaction object to front end to be sent
        // once sent front end will send confirmation to change deployed_status to "complete" and metadata should be pinned to IPFS as to not be garbage collected.
        
        // if transaction fails delete image & delete event form db, change deployed_status to "failed", since metadata is unpinned to will be deleted
        // return this.ethereumService.createEvent()
    }


    // @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'UploadFile')
    async uploadFile(file: UploadImageRequest) {
      return this.ethereumService.uploadDecentralised(file)
    } 

    // // @UseGuards(GrpcAuthGuard)
    // @GrpcMethod('BlockchainService', 'DeleteFile')
    // async deleteFile(file: DeleteImageRequest) {
    //     return this.ethereumService.deleteFile(file)
    // } 
}
