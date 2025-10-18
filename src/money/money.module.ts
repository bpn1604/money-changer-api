import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { MoneyController } from './money.controller';
import { MoneyService } from './money.service';

@Module({
  imports: [UserModule], // Need access to UserService/TypeORM for capacities and transactions
  controllers: [MoneyController],
  providers: [MoneyService],
})
export class MoneyModule {}