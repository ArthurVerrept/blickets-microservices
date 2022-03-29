import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthenticationModule } from './authentication/authentication.module'
import { DatabaseModule } from './database/database.module'
import { GoogleAuthenticationModule } from './models/google-authentication/google-authentication.module'
import { UserModule } from './models/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    GoogleAuthenticationModule,
    UserModule,
    AuthenticationModule
  ]
})
export class AppModule {}
