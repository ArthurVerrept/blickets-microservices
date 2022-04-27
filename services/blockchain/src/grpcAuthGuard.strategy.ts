import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common'
import { status } from '@grpc/grpc-js'
import {Observable} from 'rxjs'
import {JwtService} from '@nestjs/jwt'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class GrpcAuthGuard implements CanActivate {

    constructor(private  jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const type = context.getType()
        const prefix = 'Bearer '
        let header
        let metadata
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
        
        // no matter what re-set user as this stops a lot of weird errors
        metadata.set('user', this.jwtService.decode(token)) 
        
        try {
            const valid = this.jwtService.verify(token)
            return true
        } catch (e) {
            throw new RpcException({
                code: status.UNAUTHENTICATED,
                message: e
            })
        }
    }
}