import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod, RpcException } from '@nestjs/microservices'
import { GrpcAuthGuard } from '../grpcAuthGuard.strategy'
import { status } from '@grpc/grpc-js'
import { EthereumService } from './ethereum.service'
import { UploadImageRequest, DeleteImageRequest } from 'proto-npm'
import { v4 as uuidv4 } from 'uuid'
import AWS from 'aws-sdk'
import { ConfigService } from '@nestjs/config'

@Controller('ethereum')
export class EthereumController {
    constructor(private ethereumService: EthereumService, private configService: ConfigService) {
        console.log(this.configService.get('AWS_ACCESS_KEY_ID'))
        AWS.config.update({ accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'), secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') })
    }

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'CreateEthereumAccount')
    createAccount() {
        return this.ethereumService.createEthereumAccount()
    }

    // @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'UploadFile')
    async uploadFile(file: UploadImageRequest) {
        // if the size is bigger than 10 mb return an error
        if(Buffer.byteLength(file.binary)/1000000 > 10) {
            throw new RpcException({
                code: status.INVALID_ARGUMENT,
                message: 'Image must not be larger than 10mb'
            })
        }

        if(file.mime !== 'image/jpeg' && file.mime !== 'image/png' && file.mime !== 'image/gif') {
            throw new RpcException({
                code: status.INVALID_ARGUMENT,
                message: 'Image must be of correct format'
            })
        }

        const s3 = new AWS.S3()
        const id = uuidv4()

        const upload = await s3.upload({
            Bucket: 'blickets1/ticket_artwork',
            Key: id,
            Body: file.binary,
            ContentType: file.mime,
            ACL: 'public-read'
          }).promise()
        return {id, url: upload.Location}
      } 

    // @UseGuards(GrpcAuthGuard)
    @GrpcMethod('BlockchainService', 'DeleteFile')
    async deleteFile(file: DeleteImageRequest) {

        const s3 = new AWS.S3()
        await s3.deleteObject({
            Bucket: 'blickets1/ticket_artwork',
            Key: file.id
          }).promise()
        return {}
      } 
}
