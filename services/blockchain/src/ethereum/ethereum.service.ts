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
import { UploadImageRequest, DeployEventRequest } from 'proto-npm'
import { NFTStorage, File } from 'nft.storage'
import axios from'axios'

@Injectable()
export class EthereumService {
    web3: Web3
    s3: AWS.S3
    nftStorageKey: string
    BN

    eventContract: Contract
    eventABI: any = eventABI

    eventFactoryContract: Contract
    eventFactoryABI: any = eventFactoryABI

    EventFactoryContractAddress: string

    constructor(private configService: ConfigService) {
        // AWS.config.update({ accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'), secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') })
        // this.s3 = new AWS.S3()
        this.nftStorageKey = this.configService.get('NFT_STORAGE_KEY')
        this.web3 = new Web3("https://eth-rinkeby.alchemyapi.io/v2/6PPyDP1pp4gHaYKHFm8o3G_CKiQuA1JX")
        // this.web3 = new Web3("https://eth-goerli.alchemyapi.io/v2/6BG6x2EmqojNNgMy1lr9MFeX1N7wVAwf")
        this.EventFactoryContractAddress = '0x02952C1268330358A9979159313fd9A5FC17120B'      // rinkeby
        // this.EventFactoryContractAddress = '0x5F313e120429320608DB5D7e1F54f98785c5AeC4'         // goerli
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

    // async createEvent() {
    //     const deployed = await this.eventFactoryContract.methods.getDeployedEvents().call()
    //     return { addresses: deployed }
    // }


    async uploadDecentralised(file: UploadImageRequest) {
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
        const image = new File([file.binary], id, { type: file.mime })

        const nftstorage = new NFTStorage({ token: this.nftStorageKey })

        // call client.store, passing in the image & metadata
        const nftRet = await nftstorage.store({
            image,
            name: 'name',
            description: 'description'
        })

        return { cid: nftRet.ipnft, url: nftRet.url }
    }
    

    async createTransactionData(eventData: DeployEventRequest) {
        const data = this.web3.eth.abi.encodeFunctionCall({
            name: 'createEvent',
            type: 'function',
            inputs: [
                {
                    type: 'string',
                    name: '_name'
                },
                {
                    type: 'string',
                    name: '_eventName'
                },
                {
                    type: 'uint256',
                    name: '_ticketAmount'
                },
                {
                    type: 'uint256',
                    name: '_ticketPrice'
                },
                {
                    type: 'uint256',
                    name: '_resaleCost'
                }
            ]
        }, [eventData.name, eventData.eventName, eventData.ticketAmount, this.web3.utils.toWei(eventData.ticketPrice), this.web3.utils.toWei(eventData.resaleCost)])


        const transactionParams = {
            to: this.EventFactoryContractAddress,
            data
        }

        return transactionParams
    }

    async transactionStatus(txHash: string) {
        const res =  await this.web3.eth.getTransactionReceipt(txHash)
        console.log(res)

        // res will be null while transaction is confirming
        if (res == null) {
            return 'pending'
        }
        if(res.status == true) {
            // to view internal transactions (contract creations from within a contract) use etherscan api
            // match the txHash passed in with the hash field to get the new contract address at contractAddress
            // https://api-rinkeby.etherscan.io/api?module=account&action=txlistinternal&address=0x02952c1268330358a9979159313fd9a5fc17120b&sort=asc&apikey=YourApiKeyToken
            const internalTransactions = await axios.get(`https://api-rinkeby.etherscan.io/api?module=account&action=txlistinternal&address=${this.EventFactoryContractAddress}&sort=asc&apikey=YourApiKeyToken`)
            // console.log(internalTransactions.data.result)  
            internalTransactions.data.result.forEach((txn) => {
                if (txn.hash === txHash) {
                    // this is the new contract address to be added to the mongodb entry
                    console.log(txn.contractAddress)
                }
            })
        }

        return {}
    }

    // async uploadFile(file: UploadImageRequest) {
    //     // if the size is bigger than 10 mb return an error
    //     if(Buffer.byteLength(file.binary)/1000000 > 10) {
    //         throw new RpcException({
    //             code: status.INVALID_ARGUMENT,
    //             message: 'Image must not be larger than 10mb'
    //         })
    //     }

    //     if(file.mime !== 'image/jpeg' && file.mime !== 'image/png' && file.mime !== 'image/gif') {
    //         throw new RpcException({
    //             code: status.INVALID_ARGUMENT,
    //             message: 'Image must be of correct format'
    //         })
    //     }

    //     new File([file.binary], 'idk', { type: file.mime })
    //     const id = uuidv4()
    //     console.log(id)
    //     const upload = await this.s3.upload({
    //         Bucket: 'blickets1/ticket_artwork',
    //         Key: id,
    //         Body: file.binary,
    //         ContentType: file.mime,
    //         ACL: 'public-read'
    //       }).promise()
    //     return {id, url: upload.Location}
    // }

    // async deleteFile(file: DeleteImageRequest) {
    //     await this.s3.deleteObject({
    //         Bucket: 'blickets1/ticket_artwork',
    //         Key: file.id
    //       }).promise()
    //     return {}
    // }
}
