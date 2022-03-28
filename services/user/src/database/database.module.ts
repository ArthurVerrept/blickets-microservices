import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

@Module({
    imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return process.env.DATABASE_URL ? {
          url: process.env.DATABASE_URL,
          type: 'postgres',
          ssl: {
            rejectUnauthorized: false
          },
          entities: [
            'dist/src/**/*.entity.js'
          ],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false
        } : {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DB'),
          entities: [
            'dist/src/**/*.entity.js'
          ],
          namingStrategy: new SnakeNamingStrategy(),
          // synchronize should only be used for local development
          // this automatically changes the db on save if entities 
          // are different, in prod you could lose whole tables
          // accidentally if you have this on
          synchronize: true
        }
      }
    })
  ]
})
export class DatabaseModule {}
