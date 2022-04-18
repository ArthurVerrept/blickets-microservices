import { Metadata } from '@grpc/grpc-js'
import { Body, Controller, Get, Inject, OnModuleInit, Post } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { UserService, UserServiceName, GoogleAuthCode } from 'proto-npm'
import { Meta } from 'src/common/decorators/meta.decorator'

@Controller('user')
export class UserController implements OnModuleInit {
    private userService: UserService

    onModuleInit(): void {
        this.userService = this.client.getService<UserService>('UserService')
    }

    constructor(
        @Inject(UserServiceName) private client: ClientGrpc,
    ) {}
    
    @Get('auth-url')
    genAuthUrl() {
        return this.userService.genGoogleAuthUrl({})
    }

    @Post('google-login')
    getTokens(@Body() authCode: GoogleAuthCode) {
        return this.userService.googleLogin(authCode)
    }

    @Post('refresh-token')
    refreshTokens(@Meta() metadata: Metadata) {
        return this.userService.refresh({}, metadata)
    }
}
