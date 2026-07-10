import { Inject, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { USER_REPOSITORY } from '../database/repositories/interfaces/user.repository.interface';
import type { IUserRepository } from '../database/repositories/interfaces/user.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  findByIdentity(email?: string, walletAddress?: string): Promise<User | null> {
    if (email) {
      return this.userRepository.findByEmail(email);
    }
    if (walletAddress) {
      return this.userRepository.findByWalletAddress(walletAddress);
    }
    return Promise.resolve(null);
  }

  create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async createShadowUser(email: string | undefined, walletAddress: string | undefined, role: string): Promise<User> {
    try {
      const user = this.userRepository.create({ email, walletAddress, role } as Partial<User>);
      return await this.userRepository.save(user);
    } catch (err: any) {
      // Handle PostgreSQL unique constraint violation (code 23505)
      // Redis implementation simulates this by throwing an error with code '23505'
      if (err.code === '23505') {
        const existingUser = await this.findByIdentity(email, walletAddress);
        if (existingUser) return existingUser;
      }
      throw err;
    }
  }
}
