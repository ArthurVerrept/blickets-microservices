import { Module } from '@nestjs/common'
import { AuthenticationService } from './authentication.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UserModule } from 'src/models/user/user.module'
import { AuthenticationController } from './authentication.controller'

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET')
          })
        }),
        UserModule
    ],
    providers: [AuthenticationService],
    exports:[AuthenticationService],
    controllers: [AuthenticationController]
    // controllers: [AuthController]
})
export class AuthenticationModule {}
