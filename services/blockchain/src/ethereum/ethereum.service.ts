import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { Contract } from 'web3-eth-contract'
import { Metadata, status } from '@grpc/grpc-js'
import { ConfigService } from '@nestjs/config'
import { ClientGrpc, RpcException } from '@nestjs/microservices'
import Web3 from 'web3'
import { v4 as uuidv4 } from 'uuid'
import AWS from 'aws-sdk'
import eventABI from '../helpers/eventABI.json'
import eventFactoryABI from '../helpers/eventFactoryABI.json'
import { UploadImageRequest, DeployEventRequest, EventServiceName, EventService, BuyTicketsParamsRequest } from 'proto-npm'
import { NFTStorage, File, Blob } from 'nft.storage'
import axios from'axios'
import { lastValueFrom } from 'rxjs'
import { AlchemyWeb3, AssetTransfersCategory, createAlchemyWeb3 } from '@alch/alchemy-web3'

@Injectable()
export class EthereumService implements OnModuleInit {
    private eventService: EventService

    onModuleInit(): void {
        this.eventService = this.client.getService<EventService>('EventService')
    }
    nftstorage: NFTStorage
    web3: Web3
    alchemyWeb3: AlchemyWeb3
    s3: AWS.S3
    BN

    eventContract: Contract
    eventABI: any = eventABI

    eventFactoryContract: Contract
    eventFactoryABI: any = eventFactoryABI

    EventFactoryContractAddress: string

    constructor(
        private configService: ConfigService,
        @Inject(EventServiceName) private client: ClientGrpc,
        private httpService: HttpService
    ) {
        // AWS.config.update({ accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'), secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') })
        // this.s3 = new AWS.S3()
        this.nftstorage = new NFTStorage({ token: this.configService.get('NFT_STORAGE_KEY') })
        this.alchemyWeb3 = createAlchemyWeb3('https://eth-rinkeby.alchemyapi.io/v2/6PPyDP1pp4gHaYKHFm8o3G_CKiQuA1JX')
        this.web3 = new Web3('https://eth-rinkeby.alchemyapi.io/v2/6PPyDP1pp4gHaYKHFm8o3G_CKiQuA1JX')
        // this.web3 = new Web3("https://eth-goerli.alchemyapi.io/v2/6BG6x2EmqojNNgMy1lr9MFeX1N7wVAwf")
        this.EventFactoryContractAddress = '0xdc81e5a6d725bc99e41409807b78bbc3af0aa2c7'      // rinkeby
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

    async ethPrice() {
        const ethPrice = await axios.get(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=4YSEQETQN57VR2BENRNWBJ9RTGS9R66X7T`)
        if (ethPrice.data.status === '0') {
            throw new RpcException({
                code: status.RESOURCE_EXHAUSTED,
                message: `ETHERSCAN API ERROR ${ethPrice.data.result}`
            })
        }

        return { ethPriceUSD: parseFloat(ethPrice.data.result.ethusd), lastTime: parseInt(ethPrice.data.result.ethusd_timestamp) }
    }

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


        // call client.store, passing in the image & metadata
        const nftRet = await this.nftstorage.store({
            image,
            name: 'name',
            description: 'description'
        })

        // https://bafyreih4cvvrpgpz5vfvdx35vemukcffc27fwxm7rpna33377zgfazt6fy.ipfs.nftstorage.link/metadata.json
        const ipfsData$ = this.httpService.get(`http://${nftRet.ipnft}.ipfs.nftstorage.link/metadata.json`)
        const ipfsData = await lastValueFrom(ipfsData$)

        const str = ipfsData.data.image
        const first = str.split('//')[1]
        const cid = first.split('/')[0]

        const ref = first.split('/')[1]

        const httpImageUrl = `https://${cid}.ipfs.nftstorage.link/${ref}`

        return { imageUrl: httpImageUrl }
    }
    

    async deployEventParameters(eventData: DeployEventRequest) {
        const data = this.eventFactoryContract.methods.createEvent(eventData.name, eventData.symbol, eventData.ticketAmount, this.web3.utils.toWei(eventData.ticketPrice), this.web3.utils.toWei(eventData.resaleCost)).encodeABI()

        const transactionParams = {
            to: this.EventFactoryContractAddress,
            data
        }

        return transactionParams
    }

    async transactionStatus(txHash: string, metadata: Metadata) {
        // try getting the transaction receipt which tells us the status of the transaction
        const res =  await this.web3.eth.getTransactionReceipt(txHash)

        // res will be null while transaction is confirming on blockchain
        if (res == null) {
            return 'pending'
        }
        if(res.status == true) {
            // to view internal transactions of a contract (contract creations from within a contract) use etherscan api
            // match a txHash from mongodb passed in with a hash field returned from the hashes on the contract to get the new contract address
            const internalTransactions = await axios.get(`https://api-rinkeby.etherscan.io/api?module=account&action=txlistinternal&address=${this.EventFactoryContractAddress}&sort=asc&apikey=YourApiKeyToken`)
            // if etherscan responds status of 0 (which is dumb asf btw) it means we
            // have done too many api calls and so we error
            if (internalTransactions.data.status === '0') {
                throw new RpcException({
                    code: status.RESOURCE_EXHAUSTED,
                    message: `ETHERSCAN API ERROR ${internalTransactions.data.result}`
                })
            }
            
            // if not we have the data, we look through each transaction hash within our contract to find the correct transaction
            // this is to retrieve the new contract's address
            for(const txn of internalTransactions.data.result) {
                // if they match, we have the correct transaction
                if (txn.hash === txHash) {
                    // this is where the new contract address is passed with the txnHash to the event microservice to update the entry
                    const newStat$ = this.eventService.updateEventStatus({ txHash, contractAddress: txn.contractAddress }, metadata)
                    // rxjs observables mean we have to do this jank lastValueFrom function to wait for a response
                    await lastValueFrom(newStat$)
                    return {}
                }
            }
        }
        
        if (res.status == false) {
            // here we dont sent the contract address which tells the event service
            // to set the event status as 'failed'
            const newStat$ = this.eventService.updateEventStatus({ txHash }, metadata)
            // rxjs observables mean we have to do this jank lastValueFrom function to wait for a response
            await lastValueFrom(newStat$)
            return {}
        }
    }

    async displayDetails(contractAddress: string) {
        // try{
        //     const a = await this.alchemyWeb3.alchemy.getAssetTransfers({
        //         fromBlock: this.web3.utils.toHex(0),
        //         toAddress: '0xA705121486a1440CF621615c4F312EdE7d89146D',
        //         category: [AssetTransfersCategory.ERC721]
        //     })
        //     console.log(a)
        // }catch (e){
        //     console.log(e)
        // }
        const currentContract = new this.web3.eth.Contract(this.eventABI, contractAddress)
        const ticketPrice = await currentContract.methods.ticketPrice.call().call()
        const ticketAmount = await currentContract.methods.ticketAmount.call().call()
        const ticketIdCounter = await currentContract.methods.ticketIdCounter.call().call()
        const priceEth = parseFloat(this.web3.utils.fromWei(ticketPrice))
        return { ticketPrice: priceEth, ticketIdCounter: parseInt(ticketIdCounter), ticketAmount: parseInt(ticketAmount) }
    }

    // Currently unused kept for future if needed
    async ticketPriceWei(contractAddress: string) {
        const currentContract = new this.web3.eth.Contract(this.eventABI, contractAddress)
        const ticketPrice = await currentContract.methods.ticketPrice.call().call()
        return { ticketPriceWei: ticketPrice }
    }
    
    
    // currently unused kept for future if needed
    async blockchainEventName(contractAddress: string) {
        const currentContract = new this.web3.eth.Contract(this.eventABI, contractAddress)
        const eventName = await currentContract.methods.name.call().call()
        const symbol = await currentContract.methods.symbol.call().call()
        return { eventName, symbol }
    }

    async buyTicketParams(req: BuyTicketsParamsRequest, metadata) {
        try {
            const userEvent$ = this.eventService.createUserEvent({ contractAddress: req.contractAddress, walletAddress: req.walletAddress }, metadata) 
            await lastValueFrom(userEvent$)
        } catch (e) {
            console.log(e)
            throw new RpcException({
              code: status.UNKNOWN,
              message: e
          })
        }

        const currentContract = new this.web3.eth.Contract(this.eventABI, req.contractAddress)

        // removed id counter since a purchase of multiple tickets breaks it
        // const ticketIdCounter = await currentContract.methods.ticketIdCounter.call().call()
        // get date, event name and image url from db
        const event$ = this.eventService.eventByContractAddress({ contractAddress: req.contractAddress }, metadata)
        const event = await lastValueFrom(event$)
        const cleanScript = {
            name: 'Ticket',
            description: 'An NFT that grants you access to ' + event.eventName + ', this NFT will be locked for resale on every website other than Blickets.com until the day after the event. You will be able to list this item however the sale will not go through unless it is past the event date.',
            image: event.imageUrl,
            attributes: [
                {
                    display_type: "date", 
                    trait_type: "event date", 
                    value: parseInt(event.eventDate)
                }
            ]
        }
        // Create Token Uri 
        const jsonse = JSON.stringify(cleanScript)

        const content = new Blob([jsonse], {type: "application/json"})
        

        try {
            // upload token uri to ipfs
            const cid = await this.nftstorage.storeBlob(content)

            const ipfsLink = `https://${cid}.ipfs.dweb.link`

            const data = currentContract.methods.buyTickets(req.purchaseAmount, ipfsLink).encodeABI()
            const ticketPrice = await currentContract.methods.ticketPrice.call().call()
            const value = this.web3.utils.toHex(ticketPrice)
            const transactionParams = {
                to: req.contractAddress,
                data,
                value
            }

            return transactionParams

        } catch (e) {
            // TODO add check that they do not already own a ticket before removeing it from their account
            const userEvent$ = this.eventService.deleteUserEvent({ contractAddress: req.contractAddress, walletAddress: req.walletAddress }, metadata) 
            await lastValueFrom(userEvent$)
            console.log(e)
            throw new RpcException({
                code: status.UNKNOWN,
                message: e
            })
        }
    }


    // currently unused kept for future if needed
    async allMyEvents(walletAddress, metadata) {
        // get events that user is going to addresses from mongodb
        const userEvents$ = this.eventService.allUserEvents({walletAddress}, metadata)
        const userEventContractAddresses = await lastValueFrom(userEvents$)

        if(!userEventContractAddresses.contractAddresses) {
            return {}
        }
        const userTickets = []
        // TODO: filter by address (which needs to be passed in)
        try {
            // get all the tokens transferred to the users account from the list of 
            // contract addresses above
            const a = await this.alchemyWeb3.alchemy.getAssetTransfers({
                fromBlock: this.web3.utils.toHex(0),
                contractAddresses: userEventContractAddresses.contractAddresses,
                toAddress: walletAddress,
                category: [AssetTransfersCategory.ERC721]
            })

            // if user has no tickets return empty object for grpc to be happy
            if(!a.transfers.length) {
                return {}
            }

            const eventInfo = []
            // TODO: for each users event get data from event service
            for (const contract of userEventContractAddresses.contractAddresses) {
                const eventInfo$ = this.eventService.eventByContractAddress({ contractAddress: contract }, metadata)
                eventInfo.push(await lastValueFrom(eventInfo$))
            }
            // console.log(eventInfo)

            // for each transfer get link to tokenURI (metadata etc)
            for (const transfer of a.transfers) {
                const currentContract = new this.web3.eth.Contract(this.eventABI, transfer.rawContract.address)
                const tokenURI = await currentContract.methods.tokenURI(this.web3.utils.hexToNumber(transfer.tokenId)).call()


                const [currEventInfo] = eventInfo.filter(e => e.contractAddress === transfer.rawContract.address)
                const ret = {
                    tokenURI,
                    contractAddress: transfer.rawContract.address,
                    ticketNumber: this.web3.utils.hexToNumber(transfer.tokenId),
                    eventName: currEventInfo.eventName,
                    symbol: currEventInfo.symbol,
                    eventDate: currEventInfo.eventDate,
                    ticketAmount: currEventInfo.ticketAmount
                }
                userTickets.push(ret)
            }
        } catch (e){
            console.log(e)
        }

        return { events: userTickets }
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
