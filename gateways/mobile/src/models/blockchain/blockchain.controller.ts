import { Metadata } from '@grpc/grpc-js'
import { Body, Controller, Get, HttpCode, Inject, OnModuleInit, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { BlockchainService, BlockchainServiceName, DeleteImageRequest, CreateEventRequest } from 'proto-npm'
import { ApiBody, ApiConsumes } from '@nestjs/swagger'
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
        return this.blockchainService.getEvents({}, metadata)
    }
    
    @Post('create-event')
    createEvent(@Meta() metadata: Metadata, @Body() eventData: CreateEventRequest) {
        console.log(eventData)
        // a return of just an object means there are no deployed contracts
        return this.blockchainService.createEvent(eventData, metadata)
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
    
    // @HttpCode(200)
    // @Post('delete-image')
    // deleteImage(@Meta() metadata: Metadata, @Body() file: DeleteImageRequest) {
    //     return this.blockchainService.deleteFile(file, metadata)
    // }
}
