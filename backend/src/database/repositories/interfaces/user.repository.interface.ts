import { User } from '../../../users/entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByWalletAddress(walletAddress: string): Promise<User | null>;
  create(data: Partial<User>): User;
  save(user: User): Promise<User>;
}
