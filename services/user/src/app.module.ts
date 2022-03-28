import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { GoogleAuthenticationModule } from './google-authentication/google-authentication.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('JWT_SECRET')
      })
    }),
    GoogleAuthenticationModule
  ]
})
export class AppModule {}
