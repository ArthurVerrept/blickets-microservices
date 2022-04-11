import { Metadata } from '@grpc/grpc-js'
import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { UserService, UserServiceName, AuthCode } from 'proto-npm'
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

    @Post('google-login')
    getTokens(@Body() authCode: AuthCode) {
        return this.userService.login(authCode)
    }

    @Post('refresh-token')
    refreshTokens(@Meta() metadata: Metadata) {
        return this.userService.refresh({}, metadata)
    }
}
