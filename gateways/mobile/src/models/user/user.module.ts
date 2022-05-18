import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UserServiceName, UserServicePath } from '@arthurverrept/proto-npm'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { credentials } from '@grpc/grpc-js'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: UserServiceName,
        transport: Transport.GRPC,
        options: {
            package: UserServiceName,
            protoPath: UserServicePath,
            url: 'user-3jjrtrh3ha-ew.a.run.app:443',
            credentials: credentials.createSsl()
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
  providers: []
})
export class UserModule {}
