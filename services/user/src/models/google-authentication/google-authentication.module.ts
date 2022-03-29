import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthenticationModule } from 'src/authentication/authentication.module'
import { UserModule } from '../user/user.module'
import { GoogleAuthenticationController } from './google-authentication.controller'
import { GoogleAuthenticationService } from './google-authentication.service'

@Module({
  imports:[ConfigModule, UserModule, AuthenticationModule],
  controllers: [GoogleAuthenticationController],
  providers: [GoogleAuthenticationService]
})
export class GoogleAuthenticationModule {}
