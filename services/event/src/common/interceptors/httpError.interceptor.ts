import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Observable, throwError } from 'rxjs'
import { status } from '@grpc/grpc-js'
import { catchError } from 'rxjs/operators'

@Injectable()
export class HttpErrorIntercept implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // TODO: in the future look at this
    // https://docs.nestjs.com/microservices/exception-filters#exception-filters
    return next.handle().pipe(
      catchError(err => {
        // if the error is http turn into rpc
        if (err.status) {
        return throwError(() => new RpcException({
              code: status.UNKNOWN,
              message: err.response
          }))
        // otherwise just return the rpc error 
        } else {
          console.log(err)
          return throwError(() => new RpcException(err))
        }
      })
    )
  }
} 