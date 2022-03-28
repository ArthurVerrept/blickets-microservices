import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UserService } from './user.service'
import { UserServiceName, UserServicePath } from 'proto-npm'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: UserServiceName,
        transport: Transport.GRPC,
        options: {
            package: UserServiceName,
            protoPath: UserServicePath
        }
      }
    ]),
    ConfigModule,
    JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET')
        })
    })
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
