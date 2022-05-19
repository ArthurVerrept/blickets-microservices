import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { status } from '@grpc/grpc-js'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import { Auth, google } from 'googleapis'
import { GoogleAuthCode } from '@arthurverrept/proto-npm'
import { UserService } from '../user/user.service'
import User from '../user/entities/user.entity'
import { AuthenticationService } from 'src/authentication/authentication.service'

@Injectable()
export class GoogleAuthenticationService {
  oauthClient: Auth.OAuth2Client
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthenticationService))
    private readonly authenticationService: AuthenticationService
  ) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID')
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET')
 
    this.oauthClient = new google.auth.OAuth2(
      clientID,
      clientSecret,
      'https://neon-bublanina-2cabfe.netlify.app/google-redirect'
    )
  }

  generateAuthUrl() {
    const url = this.oauthClient.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',

      scope: ['profile', 'email']
    })
    return { url }
  }


  async login(authCode: GoogleAuthCode) {
      try {
        // get access and refresh tokens from google
        const { tokens } = await this.oauthClient.getToken(authCode)
        
        return await this.getAppTokensForUser(tokens.access_token, tokens.refresh_token)
      } catch (e) {
        throw new RpcException({
          code: status.PERMISSION_DENIED,
          message: 'Invalid Google grant, go through sign in flow again'
      })
      }
  }

  // this function takes the access and refresh tokens,
  // tries to find the user by email, if he exists return
  // our own access and refresh tokens, else add them to db
  // then return our own access and refresh token
  async getAppTokensForUser(googleAccessToken?: string, googleRefreshToken?: string) {
      // get email from google using access token
      const tokenInfo = await this.oauthClient.getTokenInfo(googleAccessToken)

      const email = tokenInfo.email

      try {
        // if they exist get access and refresh for this app
        const user = await this.userService.getByEmail(email)
        
        // if the refresh token has been revoked set the new got from signing in
        if (googleRefreshToken) {
          this.userService.changeThirdPartyRefreshToken(user.id, googleRefreshToken)
        }

        // get JWT tokens
        const { refreshToken, accessToken } = await this.handleRegisteredUser(user)
        
        // save app refresh token to db
        await this.userService.changeCurrentRefreshToken(user.id, refreshToken)
  
        return { refreshToken, accessToken, addresses: user.addresses }
  
        // for some reason the error object is wrapped in another error
      } catch ({error}) {
        if (error.code !== 5) {
          throw new RpcException({
            code: status.UNIMPLEMENTED,
            message: error.message
          })
        }
  
        // add them into db
        const user = await this.userService.createWithGoogle(email, googleRefreshToken)
        
        // get access and refresh for our app
        const { refreshToken, accessToken } = await this.handleRegisteredUser(user)
        
        // save app refresh token to db
        await this.userService.changeCurrentRefreshToken(user.id, refreshToken)
        
        return { refreshToken, accessToken }
      }
  }

  async handleRegisteredUser(user: User) {
    if (!user.isCreatedWithGoogle) {
      throw new RpcException({
            code: status.PERMISSION_DENIED
      })
    }

    return this.authenticationService.getCookiesWithJwtToken(user)
  }

  async getUserData(googleRefreshToken: string) {
    const userInfoClient = google.oauth2('v2').userinfo
    
    this.oauthClient.setCredentials({
      refresh_token: googleRefreshToken
    })
    
    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient
    })
    
    // make a specific response so in the future if there
    // are more oath2 providers theres consistency in the
    // getUserData response
    const returnObj = {
      email: userInfoResponse.data.email,
      name: userInfoResponse.data.name,
      picture: userInfoResponse.data.picture
    }

    return returnObj
  }
}
