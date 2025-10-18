// src/transaction/transaction.controller.ts (Corrected)

import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  // ParseIntPipe, // Not strictly needed here, but can remain if used elsewhere
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
    // The type is used here in a decorated signature
    @Request() req: AuthenticatedRequest, 
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    const userId = req.user.userId;

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    return this.transactionService.getHistory(userId, startDate, endDate);
  }
}