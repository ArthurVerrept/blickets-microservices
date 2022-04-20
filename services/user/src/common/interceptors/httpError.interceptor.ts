import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Observable, throwError } from 'rxjs'
import { status } from '@grpc/grpc-js'
import { catchError } from 'rxjs/operators'

@Injectable()
export class HttpErrorIntercept implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
          return throwError(() => err)
        }
      }),
    )
  }
} 