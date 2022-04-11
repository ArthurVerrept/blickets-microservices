import { Injectable } from '@nestjs/common'
import Web3 from 'web3'

@Injectable()
export class EthereumService {
    web3: Web3
    constructor() {
        this.web3 = new Web3("https://eth-mainnet.alchemyapi.io/v2/your-api-key")
    }

    createEthereumAccount() {
        return this.web3.eth.accounts.create()
    }
}
