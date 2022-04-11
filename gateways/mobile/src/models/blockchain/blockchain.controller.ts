import { Metadata } from '@grpc/grpc-js'
import { Controller, Inject, OnModuleInit, Post } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { BlockchainService, BlockchainServiceName } from 'proto-npm'
import { Meta } from 'src/common/decorators/meta.decorator'

@Controller('blockchain')
export class BlockchainController implements OnModuleInit {
    private blockchainService: BlockchainService

    onModuleInit(): void {
        this.blockchainService = this.client.getService<BlockchainService>('BlockchainService')
    }

    constructor(
        @Inject(BlockchainServiceName) private client: ClientGrpc,
    ) {}

    @Post('create-ethereum-account')
    createEthereumAccount(@Meta() metadata: Metadata) {
        return this.blockchainService.createEthereumAccount({}, metadata)
    }
}
