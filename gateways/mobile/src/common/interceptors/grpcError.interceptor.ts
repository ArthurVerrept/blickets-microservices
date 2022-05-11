import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException, BadRequestException, ForbiddenException, NotFoundException, ServiceUnavailableException, InternalServerErrorException, NotImplementedException } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError} from 'rxjs/operators'

@Injectable()
export class GrpcErrorIntercept implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        console.log(err.code)
        switch (err.code) {
          case 16:
            return throwError(() => new UnauthorizedException(err.details))
          case 13:
            return throwError(() => new BadRequestException(err.details))
          case 3:
            return throwError(() => new BadRequestException(err.details))
          case 8:
            return throwError(() => new BadRequestException(err.details))
          case 7:
            return throwError(() => new ForbiddenException(err.details))
          case 5:
              return throwError(() => new NotFoundException(err.details))
          case 12:
              return throwError(() => new NotImplementedException(err.details))
          case 14:
            return throwError(() => new ServiceUnavailableException(err.details))
          default:
             return throwError(() => new InternalServerErrorException(err.details))
        }
      }),
    )
  }
}