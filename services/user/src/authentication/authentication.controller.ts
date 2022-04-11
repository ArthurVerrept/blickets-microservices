import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { AuthenticationService } from './authentication.service'
import { GrpcRefreshAuthGuard } from './grpcRefreshAuthGuard.strategy'

@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}
    
    @UseGuards(GrpcRefreshAuthGuard)
    @GrpcMethod('UserService', 'Refresh')
    async refresh({}, metadata: Metadata) {
        console.log('in')

        return await this.authenticationService.generateNewAccessToken(metadata.getMap().user['id'])
    }   
}
