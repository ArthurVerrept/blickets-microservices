import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcAuthGuard } from '../grpcAuthGuard.strategy'
import { EthereumService } from './ethereum.service'
import { UploadImageRequest, DeployEventRequest, TransactionStatusRequest, EventNameRequest } from 'proto-npm'
import { Metadata } from '@grpc/grpc-js'

@Controller('ethereum')
export class EthereumController {
    constructor(private ethereumService: EthereumService) {}

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'CreateEthereumAccount')
    createAccount() {
        return this.ethereumService.createEthereumAccount()
    }

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'GetAllDeployedEvents')
    async getEvents() {
       return this.ethereumService.getDeployedEvents()
    }

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'DeployEventParameters')
    async DeployEventParameters(eventData: DeployEventRequest) {
        const data = await this.ethereumService.deployEventParameters(eventData)
        return data
    }


    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'TransactionStatus')
    async transactionStatus(req: TransactionStatusRequest, metadata: Metadata) {
      return this.ethereumService.transactionStatus(req.txHash, metadata)
    } 

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'UploadFile')
    async uploadFile(file: UploadImageRequest) {
      return this.ethereumService.uploadDecentralised(file)
    } 

    
    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'EventName')
    async eventName(req: EventNameRequest) {
      return this.ethereumService.eventName(req.contractAddress)
    } 
}
