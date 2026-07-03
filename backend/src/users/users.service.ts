import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  findByIdentity(email?: string, walletAddress?: string): Promise<User | null> {
    if (email) {
      return this.userRepository.findOneBy({ email });
    }
    if (walletAddress) {
      return this.userRepository.findOneBy({ walletAddress });
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
      if (err.code === '23505') {
        const existingUser = await this.findByIdentity(email, walletAddress);
        if (existingUser) return existingUser;
      }
      throw err;
    }
  }
}
