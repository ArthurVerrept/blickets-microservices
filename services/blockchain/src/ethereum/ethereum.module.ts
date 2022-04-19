import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { EthereumController } from './ethereum.controller'
import { EthereumService } from './ethereum.service'

@Module({
  imports:[
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET')
      })
    })
  ],
  controllers: [EthereumController],
  providers: [EthereumService]
})
export class EthereumModule {}
