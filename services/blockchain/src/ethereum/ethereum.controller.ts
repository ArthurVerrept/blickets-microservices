import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcAuthGuard } from '../grpcAuthGuard.strategy'
import { EthereumService } from './ethereum.service'
import { UploadImageRequest, DeleteImageRequest } from 'proto-npm'
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
    async createEvent() {
        // upload image
        // create event txn with img link
        // add event txnId to db
        // send transaction
        // if complete get contract address from txn using ID saved
        
        // if transaction fails delete image & delete event form db
       return this.ethereumService.createEvent()
    }


    // @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'UploadFile')
    async uploadFile(file: UploadImageRequest) {
      return this.ethereumService.uploadFile(file)
    } 

    // @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'DeleteFile')
    async deleteFile(file: DeleteImageRequest) {
        return this.ethereumService.deleteFile(file)
    } 
}
