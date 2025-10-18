import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('denomination_capacity')
export class DenominationCapacity {
  @PrimaryColumn()
  denomination: number; // 1, 2, 5, 10, 20

  @Column()
  currentCapacity: number;

  @Column({ default: () => 'NOW()' })
  lastResetDate: Date;
}