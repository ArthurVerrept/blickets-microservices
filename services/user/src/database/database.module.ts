import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

@Module({
    imports: [
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL ? {
        url: process.env.DATABASE_URL,
        type: 'postgres',
        ssl: {
          rejectUnauthorized: false
        },
        entities: [
          'dist/models/**/*.entity.js'
        ],
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false
      } : {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'root',
        password: 'rootPassword',
        entities: [
          'dist/models/**/*.entity.js'
        ],
        namingStrategy: new SnakeNamingStrategy(),
        // synchronize should only be used for local development
        // this automatically changes the db on save if entities 
        // are different, in prod you could lose whole tables
        // accidentally if you have this on
        synchronize: true
      }
    )
  ]
})
export class DatabaseModule {}
