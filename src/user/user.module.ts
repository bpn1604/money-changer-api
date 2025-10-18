import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DenominationCapacity } from './entities/denomination-capacity.entity';
import { Transaction } from './entities/transaction.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DenominationCapacity, Transaction]),
  ],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}