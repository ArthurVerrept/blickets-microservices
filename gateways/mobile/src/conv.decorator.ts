import { Metadata } from '@grpc/grpc-js'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Conv = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const metadata = new Metadata()
        const request = ctx.switchToHttp().getRequest()

        metadata.add('token', request.headers.authorization)

        return { ...request.body, metadata }
    }
)