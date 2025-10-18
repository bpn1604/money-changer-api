import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Transaction, TransactionStatus } from '../user/entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MoneyService {
  private readonly DENOMINATIONS = [20, 10, 5, 2, 1]; 
  private readonly MIN_AMOUNT = 11;
  private readonly MAX_AMOUNT = 1000;

  constructor(
    private userService: UserService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // Function to solve the change problem and check capacity
  private async calculateChange(
    amount: number,
  ): Promise<{ denominationsUsed: Map<number, number>; capacityAvailable: boolean }> {
    // Note: Capacity reset is handled inside userService.getCapacities()
    const capacities = await this.userService.getCapacities(); 
    const availableCapacityMap = new Map<number, number>();
    capacities.forEach((c) =>
      availableCapacityMap.set(c.denomination, c.currentCapacity),
    );

    const denominationsUsed = new Map<number, number>();
    let remainingAmount = amount;
    let capacityAvailable = true;

    for (const d of this.DENOMINATIONS) {
      if (remainingAmount === 0) break;

      const capacity = availableCapacityMap.get(d) || 0;
      const countNeeded = Math.min(
        Math.floor(remainingAmount / d),
        capacity,
      );

      if (countNeeded > 0) {
        denominationsUsed.set(d, countNeeded);
        remainingAmount -= countNeeded * d;
      }
    }

    // Capacity is available only if the remaining amount is 0
    if (remainingAmount > 0) {
      capacityAvailable = false;
    }

    return { denominationsUsed, capacityAvailable };
  }

  // Format the result into the required piped string format (1=1|5=1|10=4)
  private formatDenominationDetails(
    denominationsUsed: Map<number, number>,
  ): string {
    const parts: string[] = [];
    
    // Get keys and sort them in ascending order
    const sortedDenominations = Array.from(denominationsUsed.keys()).sort(
      (a, b) => a - b,
    );
    
    for (const d of sortedDenominations) {
      // We know count is present since we only added denominations with count > 0
      const count = denominationsUsed.get(d); 
      if (count! > 0) {
        parts.push(`${d}=${count}`);
      }
    }
    return parts.join('|');
  }

  // --- Feature 2: Money Change API Logic ---
  async requestChange(
    userId: number,
    amount: number,
  ): Promise<{ message: string; details?: string }> {
    
    // 1. ADDED VALIDATION (Service Layer Robustness)
    if (amount < this.MIN_AMOUNT || amount > this.MAX_AMOUNT) {
      throw new BadRequestException(
        `Invalid amount. Amount must be between ${this.MIN_AMOUNT} and ${this.MAX_AMOUNT}.`,
      );
    }

    // 2. Calculate change and check capacity
    const { denominationsUsed, capacityAvailable } =
      await this.calculateChange(amount);
    const denominationDetails =
      this.formatDenominationDetails(denominationsUsed);
    let status: TransactionStatus;
    let message: string;

    if (capacityAvailable) {
      // 3. SUCCESS: Update DB capacity and set status
      await this.userService.updateCapacities(denominationsUsed);
      status = TransactionStatus.SUCCESS;
      message = 'Change provided successfully.';
    } else {
      // 4. FAILURE: Set status and error message
      status = TransactionStatus.FAILED;
      message =
        'Transaction failed: Insufficient denomination capacity available for the requested amount.';
    }

    // 5. Create Transaction entry (always created regardless of status)
    const transaction = this.transactionRepository.create({
      userId,
      amountRequested: amount,
      denominationDetails,
      status,
    });
    await this.transactionRepository.save(transaction);

    // 6. Throw error if transaction failed due to capacity
    if (status === TransactionStatus.FAILED) {
      throw new BadRequestException(message);
    }

    return {
      message,
      details: denominationDetails,
    };
  }
}