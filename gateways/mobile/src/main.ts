import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { GrpcErrorIntercept } from './common/interceptors/grpcError.interceptor'

const logger = new Logger('Main')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // app.useGlobalGuards(new MetaGuard())
  app.useGlobalInterceptors(new GrpcErrorIntercept())
  await app.listen(3000, () => {
    logger.verbose('Gateway is listening...')
  })
  
}
bootstrap()
