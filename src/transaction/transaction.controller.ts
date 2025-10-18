// src/transaction/transaction.controller.ts (Corrected)

import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  ParseIntPipe, // <-- Import this pipe
  DefaultValuePipe
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// FIX: Change this standard import to 'import type'
import type { AuthenticatedRequest } from 'src/common/types/auth'; 

// --- Type/Pipe for date range parsing (Minimal setup) ---
// src/transaction/transaction.controller.ts (Corrected parseDate function)

function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}

// The controller call now works without error:
// const startDate = parseDate(startDateStr);

@Controller('transaction')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('history')
  async getHistory(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    // ADDED: Pagination parameters
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    const userId = req.user.userId;

    // Ensure page and limit are positive
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    console.log(page, limit);
    return this.transactionService.getHistory(
      userId,
      startDate,
      endDate,
      page, // Pass new parameters to service
      limit, // Pass new parameters to service
    );
  }
}