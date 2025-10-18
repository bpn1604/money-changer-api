// src/transaction/transaction.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Transaction } from '../user/entities/transaction.entity';

export interface PaginatedTransactions { // <-- ADDED 'export'
    data: Transaction[];
    total: number;
    page: number;
    lastPage: number;
    limit: number;
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  
  async getHistory(
    userId: number,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,  
    limit: number = 10, // <--- Dynamic value from controller
  ): Promise<PaginatedTransactions> {
    
   
    const whereClause: FindOptionsWhere<Transaction> = { userId };
    
   
    const skip = (page - 1) * limit; 

    
    const [data, total] = await this.transactionRepository.findAndCount({
      where: whereClause,
      order: { transactionDate: 'DESC' },
      // The `take` property uses the dynamic `limit` value:
      take: limit, 
      skip: skip,  
    });

    // --- Return Paginated Response (omitted for brevity) ---
    // ...
    
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
      limit,
    };
  }
}