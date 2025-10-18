import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface'; // Import the type for clarity

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // Explicitly type the useFactory function to satisfy the interface
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
        // Use a default value for 'secret' (though it should never be undefined in prod)
        secret: configService.get<string>('JWT_SECRET', 'a-fallback-secret-key'),
        signOptions: { 
          // Use a default value for 'expiresIn', typically a time like '1h'
           
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}