import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcAuthGuard } from '../grpcAuthGuard.strategy'
import { EthereumService } from './ethereum.service'
import { 
  UploadImageRequest, 
  DeployEventRequest, 
  TransactionStatusRequest, 
  EventDisplayRequest,
  BuyTicketsParamsRequest,
  TicketPriceWeiRequest,
  AllMyEventsRequest
} from 'proto-npm'
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
    @GrpcMethod('BlockchainService', 'EventDisplayDetails')
    async ticketPrice(req: EventDisplayRequest) {
      return this.ethereumService.displayDetails(req.contractAddress)
    } 
 

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'EthPrice')
    async ethPrice() {
      return this.ethereumService.ethPrice()
    } 

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'BuyTicketParams')
    async buyTicketParams(req: BuyTicketsParamsRequest, metadata: Metadata) {
      return this.ethereumService.buyTicketParams(req, metadata)
    } 

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'TicketPriceWei')
    async ticketPriceWei(req: TicketPriceWeiRequest) {
      return this.ethereumService.ticketPriceWei(req.contractAddress)
    } 

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'AllMyEvents')
    async allMyEvents(req: AllMyEventsRequest, metadata: Metadata) {
      return this.ethereumService.allMyEvents(req.walletAddress, metadata)
    } 
}
