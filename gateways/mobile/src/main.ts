import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { GrpcErrorIntercept } from './common/interceptors/grpcError.interceptor'

const logger = new Logger('Main')
const port =  process.env.PORT ? process.env.PORT : 3000

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  })
  // app.useGlobalGuards(new MetaGuard())
  app.useGlobalInterceptors(new GrpcErrorIntercept())

  const config = new DocumentBuilder()
  .setTitle('Blickets Gateway')
  .setDescription('The blickets api gateway for microservices')
  .setVersion('1.0')
  .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)


  await app.listen(port, () => {
    logger.verbose('Gateway is listening on port: ' + port)
  })
  
}
bootstrap()
