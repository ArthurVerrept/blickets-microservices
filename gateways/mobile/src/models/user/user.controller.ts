import { Body, Controller, Get, Inject, OnModuleInit, Post } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { UserService, UserServiceName, AuthCode } from 'proto-npm'

@Controller('user')
export class UserController implements OnModuleInit {
    private userService: UserService

    onModuleInit(): void {
        this.userService = this.client.getService<UserService>('UserService')
    }

    constructor(
        @Inject(UserServiceName) private client: ClientGrpc,
    ) {}

    @Post('google-login')
    getTokens(@Body() authCode: AuthCode) {
        console.log('in gateway', authCode.code)
        return this.userService.login(authCode)
    }
}
