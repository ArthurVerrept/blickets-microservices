import { InjectRepository } from '@nestjs/typeorm'
import { status } from '@grpc/grpc-js'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import User from './entities/user.entity'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>
    ){}

    async getOneById(id: number): Promise<User> {
      return await this.usersRepository.findOneOrFail(id) // SELECT * from user WHERE id = ?
    }

    async getByEmail(email: string): Promise<User>  {
        const user = await this.usersRepository.findOne({ email })
        if (user) {
          return user
        }
        throw new RpcException({
            code: status.NOT_FOUND,
            message: 'User with this email does not exist' 
         })
    }

    async changeThirdPartyRefreshToken(userId: number, thirdPartyRefreshToken: string) {
        await this.usersRepository.update(userId, {
            thirdPartyRefreshToken
        })
        return
      }


    async changeCurrentRefreshToken(userId: number, currentRefreshToken: string) {
        await this.usersRepository.update(userId, {
          currentRefreshToken
        })
        return
    }

    async createWithGoogle(email: string, thirdPartyRefreshToken: string): Promise<User> {
        const newUser = await this.usersRepository.create({ 
          thirdPartyRefreshToken,
          email, 
          isCreatedWithGoogle: true 
        })
    
        // Saves a given entity in the database.
        // If entity does not exist in the database
        // then inserts, otherwise update
        return this.usersRepository.save(newUser) // INSERT
    }

    // async getUser(id: number) {
    //   const user = await this.getOneById(id)
  
    //   // if created with google get google user
    //   // this is where you would add other
    //   // options for getting users from different
    //   // services
    //   if (user.isCreatedWithGoogle) {
    //     const userData = await this.googleAuthenticationService.getUserData(user.googleRefreshToken)
        
    //     return userData
    //   }
    // }

    async getUserIfRefreshTokenMatches(refreshToken: string, id: number) {
      const user = await this.getOneById(id) // findOrFail()
   
      const isRefreshTokenMatching = (refreshToken === user.currentRefreshToken)
   
      if (isRefreshTokenMatching) {
        return user
      } 
    }
}
