import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [UserModule], // To access Transaction Entity Repository
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}