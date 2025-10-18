import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { DenominationCapacity } from './entities/denomination-capacity.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly denominations = [1, 2, 5, 10, 20];
  private readonly initialCapacity: number;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(DenominationCapacity)
    private capacityRepository: Repository<DenominationCapacity>,
    private configService: ConfigService,
  ) {
    this.initialCapacity = configService.get<number>(
      'INITIAL_DENOMINATION_CAPACITY',
      10000
    );
    this.initializeCapacity();
  }

  // Find User by Mobile Number
  async findOneByMobile(mobileNumber: string): Promise<User | undefined> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash') // explicitly select the hash
      .where('user.mobileNumber = :mobileNumber', { mobileNumber })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  // --- Denomination Capacity Logic ---

  // Initialize capacities if table is empty
  async initializeCapacity(): Promise<void> {
    const count = await this.capacityRepository.count();
    if (count === 0) {
      const initialCapacities = this.denominations.map((d) => ({
        denomination: d,
        currentCapacity: this.initialCapacity,
        lastResetDate: new Date(),
      }));
      await this.capacityRepository.save(initialCapacities);
      console.log('Denomination capacities initialized.');
    }
  }

  // Check and reset capacity at midnight
  async checkAndResetCapacity(): Promise<void> {
    // We only need to check one entry as all should share the same lastResetDate
    const capacity = await this.capacityRepository.findOne({ where: {} });

    if (!capacity) {
      throw new InternalServerErrorException(
        'Capacity table not initialized properly.',
      );
    }

    const lastResetDate = new Date(capacity.lastResetDate);
    const now = new Date();

    // Check if the last reset was before today
    const needsReset =
      lastResetDate.toDateString() !== now.toDateString();

    if (needsReset) {
      await this.capacityRepository
        .createQueryBuilder()
        .update(DenominationCapacity)
        .set({
          currentCapacity: this.initialCapacity,
          lastResetDate: now,
        })
        .execute();
      console.log('Denomination capacities reset at midnight.');
    }
  }

  async getCapacities(): Promise<DenominationCapacity[]> {
    await this.checkAndResetCapacity();
    return this.capacityRepository.find({ order: { denomination: 'DESC' } }); // Get in descending order for greedy algorithm
  }

  async updateCapacities(
    denominationsUsed: Map<number, number>,
  ): Promise<void> {
    const queryRunner =
      this.capacityRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const [denomination, count] of denominationsUsed.entries()) {
        await queryRunner.manager.update(
          DenominationCapacity,
          { denomination: denomination },
          { currentCapacity: () => `currentCapacity - ${count}` },
        );
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Failed to update denomination capacities.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}