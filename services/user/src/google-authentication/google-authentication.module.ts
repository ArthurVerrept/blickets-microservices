import { Module } from '@nestjs/common'
import { GoogleAuthenticationController } from './google-authentication.controller'
import { GoogleAuthenticationService } from './google-authentication.service'

@Module({
  controllers: [GoogleAuthenticationController],
  providers: [GoogleAuthenticationService]
})
export class GoogleAuthenticationModule {}
