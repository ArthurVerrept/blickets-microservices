import { Metadata } from '@grpc/grpc-js'
import { Body, Controller, Get, Inject, OnModuleInit, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { BlockchainService, BlockchainServiceName, DeployEventRequest, TransactionStatusRequest, BuyTicketsParamsRequest, AllMyEventsRequest, WithdrawRequest } from '@arthurverrept/proto-npm'
import { Express } from 'express'
import { Meta } from 'src/common/decorators/meta.decorator'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('blockchain')
export class BlockchainController implements OnModuleInit {
    private blockchainService: BlockchainService
    
    constructor(
        @Inject(BlockchainServiceName) private client: ClientGrpc,
    ) {}
        
    onModuleInit(): void {
        this.blockchainService = this.client.getService<BlockchainService>('BlockchainService')
    }

    @Post('create-ethereum-account')
    createEthereumAccount(@Meta() metadata: Metadata) {
        return this.blockchainService.createEthereumAccount({}, metadata)
    }

    @Get('events')
    getEvents(@Meta() metadata: Metadata) {
        // a return of just an object means there are no dpeloyed contracts
        return this.blockchainService.getAllDeployedEvents({}, metadata)
    }
    
    @Post('event-deploy-parameters')
    createEventTransaction(@Meta() metadata: Metadata, @Body() eventData: DeployEventRequest) {
        // a return of just an object means there are no deployed contracts
        return this.blockchainService.deployEventParameters(eventData, metadata)
    }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor(
        // limit file upload to 100 megabytes.
        // this will be limited on the front end to 
        // 10 megabytes anyway, however, if 
        // someone wants to break my shit and hit
        // the gateway its protected here.
        'file', {
            limits: {
                fields: 0,
                fileSize: 1024 * 1024 * 100,
                files: 1
            }
        }
    ))
    uploadImage(@Meta() metadata: Metadata, @UploadedFile() file: Express.Multer.File) {
        const send = {
            binary: file.buffer,
            mime: file.mimetype
        }
        return this.blockchainService.uploadFile(send, metadata)
    }

    @Post('transaction-status')
    transactionStatus(@Meta() metadata: Metadata, @Body() txHash: TransactionStatusRequest) {
        return this.blockchainService.transactionStatus(txHash, metadata)
    }

    @Get('eth-price')
    ethPrice(@Meta() metadata: Metadata) {
        return this.blockchainService.ethPrice({}, metadata)
    }

    @Post('buy-tickets-params')
    buyTicketsParams(@Meta() metadata: Metadata, @Body() req: BuyTicketsParamsRequest) {
        return this.blockchainService.buyTicketParams(req, metadata)
    }

    @Post('my-events')
    allMyEvents(@Meta() metadata: Metadata, @Body() req: AllMyEventsRequest) {
        return this.blockchainService.allMyEvents(req, metadata)
    }

    @Post('withdraw')
    withdraw(@Meta() metadata: Metadata, @Body() req: WithdrawRequest) {
        return this.blockchainService.withdraw(req, metadata)
    }
}
