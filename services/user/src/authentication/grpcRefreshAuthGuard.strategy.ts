import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common'
import {Observable} from 'rxjs'
import { status } from '@grpc/grpc-js'
import {JwtService} from '@nestjs/jwt'
import { RpcException } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'
import { UserService } from 'src/models/user/user.service'

@Injectable()
export class GrpcRefreshAuthGuard implements CanActivate {

    constructor(
        private  jwtService: JwtService,
        private configService: ConfigService,
        private userService: UserService
        ) {}

    async canActivate(context: ExecutionContext) {
        const type = context.getType()
        const prefix = 'Bearer '
        let header
        let metadata
        this.jwtService = new JwtService({secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET')})
        if(type==='rpc') {
            metadata = context.getArgByIndex(1) // metadata

            if (!metadata) {
                throw new RpcException({
                    code: status.UNAUTHENTICATED,
                    message: 'No metadata provided'
                })
            }
            header = metadata.get('Authorization')[0]
        }
        if (!header) {
            throw new RpcException({
                code: status.UNAUTHENTICATED,
                message: 'No authorization token provided'
            })
        }

        if (!header.includes(prefix)) {
            throw new RpcException({
                code: status.UNAUTHENTICATED,
                message: 'Expected token of type Bearer'
            })
        }

        const token = header.slice(header.indexOf(' ') + 1)

        let user = metadata.getMap().user
        // if there is no user in the metadata
        if(!user) {
            user = this.jwtService.decode(token)
            // add decoded token to metadata to be used in controllers
            metadata.set('user', user) 
        }

        try {
            this.jwtService.verify(token)
            const userOrError = await this.userService.getUserIfRefreshTokenMatches(token, user.id)
            if (!userOrError) {
                throw ('Refresh token provided does not match current user refresh token')
            }
            return true
        } catch (e) {
            throw new RpcException({
                code: status.UNAUTHENTICATED,
                message: e
            })
        }
    }
}