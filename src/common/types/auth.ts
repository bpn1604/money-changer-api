import { Request } from 'express';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    mobileNumber: string;
  };
}