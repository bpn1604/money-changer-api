// src/money/money.controller.ts (Corrected)

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MoneyService } from './money.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangeRequestDto } from './dto/change-request.dto';
// FIX: Change this import to 'import type'
import type { AuthenticatedRequest } from 'src/common/types/auth'; 

@Controller('money')
@UseGuards(JwtAuthGuard)
export class MoneyController {
  constructor(private moneyService: MoneyService) {}

  @Post('change')
  @HttpCode(HttpStatus.OK)
  async requestChange(
    @Request() req: AuthenticatedRequest, // The type is used here in a decorated signature
    @Body() body: ChangeRequestDto,
  ) {
    // req.user is populated by JwtStrategy
    const userId = req.user.userId;
    return this.moneyService.requestChange(userId, body.amount);
  }
}