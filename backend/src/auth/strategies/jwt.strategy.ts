import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserRole } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => request?.cookies?.Authentication, // Extract from shared cookie
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to bearer token
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const email = payload.email?.toLowerCase();
    const wallet = payload.walletAddress?.toLowerCase();

    if (!email && !wallet) {
      throw new UnauthorizedException('JWT has neither email nor walletAddress.');
    }

    let user = await this.users.findByIdentity(email, wallet);

    if (!user) {
      const ownerEmail = process.env.SHOP_OWNER_EMAIL?.toLowerCase() || '';
      const ownerWallet = process.env.WALLET_ADDRESS?.toLowerCase() || '';

      const isOwner = (email && email === ownerEmail) || (wallet && wallet === ownerWallet);
      const role = isOwner ? UserRole.ADMIN : UserRole.CUSTOMER;

      user = await this.users.createShadowUser(email, wallet, role);
    }

    return user;
  }
}
