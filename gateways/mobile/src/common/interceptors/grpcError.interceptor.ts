import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException, BadRequestException, ForbiddenException, NotFoundException, ServiceUnavailableException, InternalServerErrorException, NotImplementedException } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError} from 'rxjs/operators'

@Injectable()
export class GrpcErrorIntercept implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        console.log(err.details)
        switch (err.code) {
          case 16:
            return throwError(() => new UnauthorizedException({ message: err.details }))
          case 13:
            return throwError(() => new BadRequestException({ message: err.details }))
          case 3:
            return throwError(() => new BadRequestException({ message: err.details }))
          case 8:
            return throwError(() => new BadRequestException({ message: err.details }))
          case 7:
            return throwError(() => new ForbiddenException({ message: err.details }))
          case 5:
              return throwError(() => new NotFoundException({ message: err.details }))
          case 12:
              return throwError(() => new NotImplementedException({ message: err.details }))
          case 14:
            return throwError(() => new ServiceUnavailableException({ message: err.details }))
          default:
             return throwError(() => new InternalServerErrorException({ message: err.details }))
        }
      })
    )
  }
}