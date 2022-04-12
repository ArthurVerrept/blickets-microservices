import { Injectable } from '@nestjs/common'
import Web3 from 'web3'

@Injectable()
export class EthereumService {
    web3: Web3
    contractAddress: string
    constructor() {
        this.web3 = new Web3("https://eth-rinkeby.alchemyapi.io/v2/6PPyDP1pp4gHaYKHFm8o3G_CKiQuA1JX")
        this.contractAddress = 'https://rinkeby.etherscan.io/tx/0x92705d7be5262bdf4a5cb0ed550b113977a456807601e5d56ef60fb06632e477'
    }

    createEthereumAccount() {
        return this.web3.eth.accounts.create()
    }
}
