import { Body, Controller, Get, Inject, OnModuleInit } from '@nestjs/common'
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

    @Get('google-login')
    getTokens(@Body() user: AuthCode) {
        return this.userService.login(user)
    }
}
