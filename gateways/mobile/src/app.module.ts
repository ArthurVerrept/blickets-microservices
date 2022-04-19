import { ConfigModule } from '@nestjs/config'
import { UserModule } from './models/user/user.module'
import { Module } from '@nestjs/common'
import { BlockchainModule } from './models/blockchain/blockchain.module'
import { EventModule } from './models/event/event.module'


@Module({
  imports: [
    ConfigModule.forRoot(),
    BlockchainModule,
    UserModule,
    EventModule
  ]
})
export class AppModule {}
