import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum TransactionStatus {
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amountRequested: number;

  // Example: "1=1|5=1|10=4"
  @Column()
  denominationDetails: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @CreateDateColumn()
  transactionDate: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;
}