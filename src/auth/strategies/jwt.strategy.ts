import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

// Define the structure of the JWT payload
export interface JwtPayload {
  userId: number;
  mobileNumber: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    // Corrected super() call: ensure secretOrKey is a definitive string
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // FIX: Use a default value as a fallback, or use the non-null assertion operator '!' 
      // if you are 100% sure it's in the .env file.
      secretOrKey: configService.get<string>('JWT_SECRET', 'a-fallback-secret-key'), 
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOneById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User specified in token not found.');
    }
    // The payload returned here will be attached to the request object (req.user)
    return { userId: user.id, mobileNumber: user.mobileNumber };
  }
}