import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This Guard will enforce JWT authentication on endpoints
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}