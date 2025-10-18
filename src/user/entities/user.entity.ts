import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 15 })
  mobileNumber: string;

  // Password should not be stored in DB as plain text. Use Bcrypt.
  @Column({ select: false }) // Important: prevents password hash from being loaded by default
  passwordHash: string;

  @Column({ default: false })
  isRegistered: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}