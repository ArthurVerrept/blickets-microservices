import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GrpcAuthGuard } from 'src/authentication/grpcAuthGuard.strategy'
import { UserService } from './user.service'
import { AddAddressRequest, AdminEmailRequest, AdminIdRequest } from '@arthurverrept/proto-npm'

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('UserService', 'AddAddress')
    async addAddress(req: AddAddressRequest, metadata: Metadata) {
        return this.userService.addAddress(req, metadata)
    }  

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('UserService', 'MyAddresses')
    async myAddresses(_, metadata: Metadata) {
        return this.userService.myAddresses(metadata)
    }  

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('UserService', 'Me')
    async me(_, metadata: Metadata) {
        return this.userService.getUser(metadata)
    } 

    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('UserService', 'AdminEmails')
    async adminEmails(req: AdminEmailRequest) {
        return this.userService.adminEmails(req)
    }   


    @UseGuards(GrpcAuthGuard)
    @GrpcMethod('UserService', 'AdminId')
    async adminId(req: AdminIdRequest) {
        return this.userService.adminId(req)
    }   
}
