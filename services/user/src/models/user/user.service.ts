import { InjectRepository } from '@nestjs/typeorm'
import { status } from '@grpc/grpc-js'
import { Repository } from 'typeorm'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import User from './entities/user.entity'
import { RpcException } from '@nestjs/microservices'
import { GoogleAuthenticationService } from '../google-authentication/google-authentication.service'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) 
        private usersRepository: Repository<User>,
        @Inject(forwardRef(() => GoogleAuthenticationService))
        private googleAuthenticationService: GoogleAuthenticationService
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

    async addAddress(req, metadata) {
      const user = await this.usersRepository.findOne({id: metadata.getMap().user.id})

      // if the address has already been saved
      
      let addresses = ['']
      if (!user.addresses) {
        
        addresses = [req.address]
      } else {
        if (user.addresses.includes(req.address)) {
          return {}
        }
        addresses = user.addresses
        addresses.push(req.address)
      }
      await this.usersRepository.update(metadata.getMap().user.id, {addresses})

      return {}
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, id: number) {
      const user = await this.getOneById(id) // findOrFail()
   
      const isRefreshTokenMatching = (refreshToken === user.currentRefreshToken)
   
      if (isRefreshTokenMatching) {
        return user
      } 
    }

    async myAddresses(metadata) {
      const user = await this.usersRepository.findOneOrFail({id: metadata.getMap().user.id})
      return { addresses: user.addresses }
    }

    async getUser(metadata) {
      const user = await this.getOneById(metadata.getMap().user.id)
  
      // if created with google get google user
      // this is where you would add other
      // options for getting users from different
      // services
      if (user.isCreatedWithGoogle) {
        const userData = await this.googleAuthenticationService.getUserData(user.thirdPartyRefreshToken)

        return userData
      }
    }

    async adminEmails(req) {
      const adminEmails = []

      // there is always at least 1 admin per event as the owner is added on creation
      for (const adminId of req.adminIds) {
        adminEmails.push(await (await this.getOneById(adminId)).email)
      }

      return { admins: adminEmails }
    }

    async adminId(req) {
      // TODO: add check to make sure request 
      try {
        const user = await this.usersRepository.findOneOrFail({ email: req.email })
        return { adminId: user.id.toString() }
      } catch (error) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Email can not be matched to user'
        })
      }
    }
}
