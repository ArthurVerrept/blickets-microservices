import { status } from '@grpc/grpc-js'
import { Controller } from '@nestjs/common'
import { GrpcMethod, RpcException } from '@nestjs/microservices'
import { AuthCode } from 'proto-npm'
import { GoogleAuthenticationService } from './google-authentication.service'

@Controller('google-authentication')
export class GoogleAuthenticationController {
    constructor(private googleAuthService: GoogleAuthenticationService) {}

    @GrpcMethod('UserService', 'Login')
    async login(authCode: AuthCode) {
        if (!authCode.code) {
            throw new RpcException({
                code: status.PERMISSION_DENIED,
                message: 'Only access this endpoint from google redirect, sign in again'
            })
        }
        return await this.googleAuthService.login(authCode)
    }     
}
