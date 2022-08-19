import { Metadata } from '@grpc/grpc-js'
import { Body, Controller, Get, Inject, OnModuleInit, Post } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { UserService, UserServiceName, GoogleAuthCode, AddAddressRequest } from '@arthurverrept/proto-npm'
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

    @Get('test')
    test() {
        const str = 'ipfs://bafybeifbbrrspimefnc2dl4jibmjffcu56jekm7axm2bww3kzm6hgmibxe/1157df52-05d1-4b46-9780-f2395f1a99f7'
        const first = str.split('//')[1]
        const cid = first.split('/')[0]

        const ref = first.split('/')[1]

        const a = `https://${cid}.ipfs.nftstorage.link/${ref}`
        console.log(a)

    // const epoch = new Date('2022-04-28').getTime()
    //   console.log(epoch)
    //   console.log(new Date(epoch))
    }
    

    @Post('google-login')
    getTokens(@Body() authCode: GoogleAuthCode) {
        return this.userService.googleLogin(authCode)
    }

    @Post('refresh-token')
    refreshTokens(@Meta() metadata: Metadata) {
        return this.userService.refresh({}, metadata)
    }

    @Post('add-address')
    addAddress(@Meta() metadata: Metadata, @Body() req: AddAddressRequest) {
        return this.userService.addAddress(req, metadata)
    }

    @Get('my-addresses')
    myAddresses(@Meta() metadata: Metadata) {
        return this.userService.myAddresses({}, metadata)
    }

    @Get('me')
    me(@Meta() metadata: Metadata) {
        return this.userService.me({}, metadata)
    }
}
