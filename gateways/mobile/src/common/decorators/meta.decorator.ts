import { Metadata } from '@grpc/grpc-js'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Meta = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()
        const metadata = new Metadata()
        metadata.add('Authorization', request.headers.authorization)
        return metadata
    }
)