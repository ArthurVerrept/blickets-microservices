import { Injectable } from '@nestjs/common'
import { Contract } from 'web3-eth-contract'
import { status } from '@grpc/grpc-js'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import Web3 from 'web3'
import { v4 as uuidv4 } from 'uuid'
import AWS from 'aws-sdk'
import eventABI from '../helpers/eventABI.json'
import eventFactoryABI from '../helpers/eventFactoryABI.json'
import { UploadImageRequest, DeleteImageRequest } from 'proto-npm'

@Injectable()
export class EthereumService {
    web3: Web3
    s3: AWS.S3

    eventContract: Contract
    eventABI: any = eventABI

    eventFactoryContract: Contract
    eventFactoryABI: any = eventFactoryABI

    EventFactoryContractAddress: string

    constructor(private configService: ConfigService) {
        AWS.config.update({ accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'), secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') })
        this.s3 = new AWS.S3()
        this.web3 = new Web3("https://eth-rinkeby.alchemyapi.io/v2/6PPyDP1pp4gHaYKHFm8o3G_CKiQuA1JX")
        this.EventFactoryContractAddress = '0x2672add3aeaa199a8b51961b739ef1231a7d5475'
        this.eventFactoryContract = new this.web3.eth.Contract(this.eventFactoryABI, this.EventFactoryContractAddress)
        // gen account from passphrase web3
        // https://stackoverflow.com/questions/68050645/how-to-create-a-web3py-account-using-mnemonic-phrase
    }

    createEthereumAccount() {
        return this.web3.eth.accounts.create()
    }

    async getDeployedEvents() {
        const deployed = await this.eventFactoryContract.methods.getDeployedEvents().call()
        return { addresses: deployed }
    }

    async createEvent() {
        const deployed = await this.eventFactoryContract.methods.getDeployedEvents().call()
        return { addresses: deployed }
    }

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

        const id = uuidv4()
        console.log(id)
        const upload = await this.s3.upload({
            Bucket: 'blickets1/ticket_artwork',
            Key: id,
            Body: file.binary,
            ContentType: file.mime,
            ACL: 'public-read'
          }).promise()
        return {id, url: upload.Location}
    }

    async deleteFile(file: DeleteImageRequest) {
        await this.s3.deleteObject({
            Bucket: 'blickets1/ticket_artwork',
            Key: file.id
          }).promise()
        return {}
    }
}
