import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException, BadRequestException, ForbiddenException, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError} from 'rxjs/operators'

@Injectable()
export class GrpcErrorIntercept implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        switch (err.code) {
          case 16:
            return throwError(() => new UnauthorizedException(this.genError(401, err.message)))
          case 13:
            return throwError(() => new BadRequestException(this.genError(400, err.message)))
          case 7:
            return throwError(() => new ForbiddenException(this.genError(403, err.message)))
          case 12:
            return throwError(() => new NotFoundException(this.genError(404, err.message)))
          case 14:
            return throwError(() => new ServiceUnavailableException(this.genError(503, err.message)))
          default:
            return throwError(() => new Error(err))
        }
      }),
    )
  }
  genError(code: number, message: string) {
    if (message) {
      const errMessage = message.split(': ')[1]
      return {statusCode: code, message: errMessage}
    }
    return null
  }
}