import { Metadata } from '@grpc/grpc-js'
import { Body, Controller, Inject, OnModuleInit, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ClientGrpc, GrpcStreamCall, GrpcStreamMethod } from '@nestjs/microservices'
import { BlockchainService, BlockchainServiceName, DeleteImageRequest } from 'proto-npm'
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
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { // 👈 this property
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    uploadImage(@Meta() metadata: Metadata, @UploadedFile() file: Express.Multer.File) {
        const send = {
            binary: file.buffer,
            mime: file.mimetype
        }
        return this.blockchainService.uploadFile(send, metadata)
    }


    @Post('delete-image')
    deleteImage(@Meta() metadata: Metadata, @Body() image: DeleteImageRequest) {
        console.log(image)
        return this.blockchainService.deleteFile(image, metadata)
    }
}
