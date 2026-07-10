import { Injectable } from '@nestjs/common';
import { User } from '../../../users/entities/user.entity';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { RedisService } from '../../redis.service';

@Injectable()
export class UserRedisRepository implements IUserRepository {
  private readonly prefix = 'user:';

  constructor(private readonly redisService: RedisService) {}

  async findByEmail(email: string): Promise<User | null> {
    const client = this.redisService.getClient();
    const keys = await client.keys(`${this.prefix}*`);

    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        const user: User = JSON.parse(data);
        if (user.email === email) {
          return user;
        }
      }
    }
    return null;
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const client = this.redisService.getClient();
    const keys = await client.keys(`${this.prefix}*`);

    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        const user: User = JSON.parse(data);
        if (user.walletAddress === walletAddress) {
          return user;
        }
      }
    }
    return null;
  }

  create(data: Partial<User>): User {
    const user = new User();
    Object.assign(user, data);
    return user;
  }

  async save(user: User): Promise<User> {
    const client = this.redisService.getClient();
    
    // Check constraints before saving
    if (user.email) {
      const existingEmail = await this.findByEmail(user.email);
      if (existingEmail && existingEmail.id !== user.id) {
        const err: any = new Error('Unique constraint violation');
        err.code = '23505'; // Emulate postgres code for unique constraint violation
        throw err;
      }
    }
    if (user.walletAddress) {
      const existingWallet = await this.findByWalletAddress(user.walletAddress);
      if (existingWallet && existingWallet.id !== user.id) {
        const err: any = new Error('Unique constraint violation');
        err.code = '23505';
        throw err;
      }
    }

    if (!user.id) {
      user.id = await client.incr('seq:user:id');
    }
    
    await client.set(`${this.prefix}${user.id}`, JSON.stringify(user));
    return user;
  }
}
