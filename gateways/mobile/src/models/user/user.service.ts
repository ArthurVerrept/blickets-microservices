import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { GetUserTokensDto } from './dto/user.dto'

@Injectable()
export class UserService {
  constructor(
  private readonly jwtService: JwtService, 
  private readonly configService: ConfigService
  ){}
    
  getTokens(user: GetUserTokensDto) {
    const payload = { sub: user.id } 
    const token = this.jwtService.sign(payload, { 
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '180s'
    })

    return { token }
  }
}
