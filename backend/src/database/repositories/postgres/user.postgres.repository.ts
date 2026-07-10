import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { IUserRepository } from '../interfaces/user.repository.interface';

@Injectable()
export class UserPostgresRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.repository.findOneBy({ walletAddress });
  }

  create(data: Partial<User>): User {
    return this.repository.create(data as User);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
