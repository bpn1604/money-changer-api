import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Import all entities
import { User } from './user/entities/user.entity';
import { Transaction } from './user/entities/transaction.entity';
import { DenominationCapacity } from './user/entities/denomination-capacity.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MoneyModule } from './money/money.module';
import { TransactionModule } from './transaction/transaction.module';


@Module({
  imports: [
    // Configure environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),

    // Configure TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DATABASE_TYPE'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Transaction, DenominationCapacity],
        synchronize: true, // Set to false in production!
        logging: false,
      }),
    }),
    AuthModule,
    UserModule,
    MoneyModule,
    TransactionModule,
  ],
})
export class AppModule {}