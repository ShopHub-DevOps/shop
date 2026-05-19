jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 1,
  email: 'admin@shop.com',
  password: 'hashed',
  role: UserRole.ADMIN,
  createdAt: new Date(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('admin@shop.com', 'admin123');
      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.login('wrong@email.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('admin@shop.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create customer and return user data', async () => {
      mockUsersService.create.mockResolvedValue({
        ...mockUser,
        role: UserRole.CUSTOMER,
      });

      const result = await service.register('customer@shop.com', 'pass123');

      expect(result.role).toBe(UserRole.CUSTOMER);
      expect(mockUsersService.create).toHaveBeenCalled();
    });
  });
});
