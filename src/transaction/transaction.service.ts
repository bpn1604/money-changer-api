import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../user/entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // --- Feature 3: Get Transaction List ---
  async getHistory(
    userId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]> {
    const whereClause: any = { userId };

    if (startDate && endDate) {
      // Add one day to endDate to include transactions from that day up to midnight
      const inclusiveEndDate = new Date(endDate);
      inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);

      whereClause.transactionDate = Between(startDate, inclusiveEndDate);
    } else if (startDate) {
      whereClause.transactionDate = Between(startDate, new Date());
    }

    // Default: return all transactions for the user
    return this.transactionRepository.find({
      where: whereClause,
      order: { transactionDate: 'DESC' },
    });
  }
}