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
import { UploadImageRequest, DeployEventRequest, EventServiceName, EventService, BuyTicketsParamsRequest, UserServiceName, UserService } from '@arthurverrept/proto-npm'
import { NFTStorage, File, Blob } from 'nft.storage'
import axios from'axios'
import { lastValueFrom } from 'rxjs'
import { AlchemyWeb3, createAlchemyWeb3 } from '@alch/alchemy-web3'

@Injectable()
export class EthereumService implements OnModuleInit {
    private eventService: EventService
    private userService: UserService

    onModuleInit(): void {
        this.eventService = this.eventClient.getService<EventService>('EventService')
        this.userService = this.userClient.getService<UserService>('UserService')
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
        @Inject(EventServiceName) private eventClient: ClientGrpc,
        @Inject(UserServiceName) private userClient: ClientGrpc,
        private httpService: HttpService
    ) {
        // AWS.config.update({ accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'), secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') })
        // this.s3 = new AWS.S3()
        this.nftstorage = new NFTStorage({ token: this.configService.get('NFT_STORAGE_KEY') })
        this.alchemyWeb3 = createAlchemyWeb3('https://eth-rinkeby.alchemyapi.io/v2/6PPyDP1pp4gHaYKHFm8o3G_CKiQuA1JX')
        this.web3 = new Web3('https://eth-rinkeby.alchemyapi.io/v2/6PPyDP1pp4gHaYKHFm8o3G_CKiQuA1JX')
        // this.web3 = new Web3("https://eth-goerli.alchemyapi.io/v2/6BG6x2EmqojNNgMy1lr9MFeX1N7wVAwf")
        this.EventFactoryContractAddress = '0xec8759ac3eeff7866e30a6eee20e3bded0fff894'      // rinkeby
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
                    await this.eventService.updateEventStatus({ txHash, contractAddress: txn.contractAddress }, metadata)
                    return {}
                }
            }
        }
        
        if (res.status == false) {
            // here we dont sent the contract address which tells the event service
            // to set the event status as 'failed'
            await this.eventService.updateEventStatus({ txHash }, metadata)
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
            await this.eventService.createUserEvent({ contractAddress: req.contractAddress, walletAddress: req.walletAddress }, metadata) 
        } catch (e) {
            // console.log(e)
            throw new RpcException({
              code: status.INTERNAL,
              message: e
          })
        }

        const currentContract = new this.web3.eth.Contract(this.eventABI, req.contractAddress)

        // removed id counter since a purchase of multiple tickets breaks it
        // const ticketIdCounter = await currentContract.methods.ticketIdCounter.call().call()
        // get date, event name and image url from db
        const event = await this.eventService.eventByContractAddress({ contractAddress: req.contractAddress }, metadata)
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
            await this.eventService.deleteUserEvent({ contractAddress: req.contractAddress, walletAddress: req.walletAddress }, metadata) 
            // console.log(e)
            throw new RpcException({
                code: status.INTERNAL,
                message: e
            })
        }
    }


    // currently unused kept for future if needed
    async allMyEvents(walletAddress, metadata) {
        // get events that user is going to addresses from mongodb
        // we do this to stop random nft's from being returned.
        const userEventContractAddresses = await this.eventService.allUserEvents({walletAddress}, metadata)
        if(!userEventContractAddresses.contractAddresses) {
            return {}
        }
        const userTickets = []
        // TODO: filter by address (which needs to be passed in)
        try {
            // get all the nft's owned from list of contracts user has purchased from
            const nfts = await this.alchemyWeb3.alchemy.getNfts({
                contractAddresses: userEventContractAddresses.contractAddresses,
                owner: walletAddress
            })

            // if user has no tickets return empty object for grpc to be happy
            if(nfts.totalCount === 0) {
                return {}
            }

            const eventInfo = []
            // for each users nft get data from event service
            for (const contract of userEventContractAddresses.contractAddresses) {
                const event = await this.eventService.eventByContractAddress({ contractAddress: contract }, metadata)
                eventInfo.push(event)
            }

            for (const nft of nfts.ownedNfts) {
                const [currEventInfo] = eventInfo.filter(e => e.contractAddress === nft.contract.address)
                const ret = {
                    media: nft.media[0]['raw'],
                    contractAddress: nft.contract.address,
                    ticketNumber: this.web3.utils.hexToNumber(nft.id.tokenId),
                    eventName: currEventInfo.eventName,
                    symbol: currEventInfo.symbol,
                    eventDate: currEventInfo.eventDate,
                    ticketAmount: currEventInfo.ticketAmount,
                    title: nft.title,
                    description: nft.description
                }
                userTickets.push(ret)
            }
        } catch (e){
            console.log(e)
        }

        return { events: userTickets }
    }

    async doesAddressOwnTicket(req) {
        const nfts = await this.alchemyWeb3.alchemy.getNfts({
            owner: req.address,
            contractAddresses: [req.contractAddress],
            withMetadata: false
        })

        if(nfts.totalCount === 0) {
            return { result: false }
        }
        
        return { result: true }
    }

    async blockchainEventInfo(req) {
        const currentContract = new this.web3.eth.Contract(this.eventABI, req.contractAddress)
        
        const contractBalance = await this.web3.eth.getBalance(req.contractAddress)

        const ticketAmount = await currentContract.methods.ticketAmount.call().call()

        const ticketsSold = await currentContract.methods.ticketIdCounter.call().call()

        const ticketPrice = await currentContract.methods.ticketPrice.call().call()


        return {
            currentBalance: this.web3.utils.fromWei(contractBalance).toString(),
            ticketAmount: ticketAmount,
            ticketsSold: ticketsSold,
            ticketPrice: this.web3.utils.fromWei(ticketPrice).toString()
        }

        // string resalePrice = 13;
    }

    async withdraw(req, metadata) {
        // check person making request owns address
        const addressesRes = await this.userService.myAddresses({}, metadata)

        if(!addressesRes.addresses.includes(req.address)){ 
            throw new RpcException({
                code: status.PERMISSION_DENIED,
                message: 'User must own address in request'
            })
        }

        const currentContract = new this.web3.eth.Contract(this.eventABI, req.contractAddress)
        const data = currentContract.methods.payout().encodeABI()
        const transactionParams = {
            to: req.contractAddress,
            data
        }
        
        return transactionParams
    }
}
