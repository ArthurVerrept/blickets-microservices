import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthenticationModule } from 'src/authentication/authentication.module'
import { UserModule } from '../user/user.module'
import { GoogleAuthenticationController } from './google-authentication.controller'
import { GoogleAuthenticationService } from './google-authentication.service'

@Module({
  imports:[
    forwardRef(() => UserModule), 
    forwardRef(() =>  AuthenticationModule),
    ConfigModule
    ],
  controllers: [GoogleAuthenticationController],
  providers: [GoogleAuthenticationService],
  exports: [GoogleAuthenticationService]
})
export class GoogleAuthenticationModule {}
