import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthCode } from 'proto-npm'

@Injectable()
export class GoogleAuthenticationService {

    async login(authCode: AuthCode) {
        try {
          console.log(authCode.code)
          // get access and refresh tokens from google
        //   const { tokens } = await this.oauthClient.getToken(authCode)
        //   console.log(tokens)
            return  {accessToken: 'asdASDasdasdasdas', refreshToken: 'asdASDasdasdasdas'}
        //   return await this.getAppTokensForUser(tokens.access_token, tokens.refresh_token)
        } catch (e) {
          console.log(e)
          throw new UnauthorizedException('Invalid Google grant, go through sign in flow again')
        }
      }
}
