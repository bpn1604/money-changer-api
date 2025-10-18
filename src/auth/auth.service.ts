import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 10; // For Bcrypt hashing

@Injectable()
export class AuthService {
  private readonly MOCKED_OTP: string;
  private tempUser: { [mobileNumber: string]: boolean } = {}; // Simple in-memory mock for OTP status

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.MOCKED_OTP = this.configService.get<string>('MOCKED_OTP')!;
  }

  // --- Feature 1: Register ---
  async register(mobileNumber: string): Promise<{ message: string }> {
    try {
      await this.userService.findOneByMobile(mobileNumber);
      throw new ConflictException('User already exists.');
    } catch (e) {
      if (e instanceof NotFoundException) {
        // User not found, proceed to create/register
        const newUser = new User();
        newUser.mobileNumber = mobileNumber;
        newUser.isRegistered = false;
        newUser.passwordHash = 'temp'; // Placeholder hash
        await this.userService.save(newUser);

        // Store temporary OTP status
        this.tempUser[mobileNumber] = false;

        return {
          message: `Registration initiated. OTP sent to ${mobileNumber}. Mocked OTP is ${this.MOCKED_OTP}`,
        };
      }
      throw e; // Re-throw conflict errors
    }
  }

  // --- Feature 1: Verify OTP ---
  async verifyOtp(
    mobileNumber: string,
    otp: string,
  ): Promise<{ message: string }> {
    if (otp !== this.MOCKED_OTP) {
      throw new UnauthorizedException('Invalid OTP.');
    }

    try {
      const user = await this.userService.findOneByMobile(mobileNumber);

      if (user?.isRegistered) {
        throw new ConflictException('User is already registered and setup.');
      }

      // Mark OTP as verified
      this.tempUser[mobileNumber] = true;
      return {
        message: 'OTP verified successfully. Proceed to set password.',
      };
    } catch (e) {
      throw new NotFoundException('User not found.');
    }
  }

  // --- Feature 1: Set Password ---
  async setPassword(
    mobileNumber: string,
    password: string,
  ): Promise<{ message: string }> {
    if (!this.tempUser[mobileNumber]) {
      throw new BadRequestException('OTP verification required before setting password.');
    }

    try {
      const user = await this.userService.findOneByMobile(mobileNumber);

      if (user?.isRegistered) {
        throw new ConflictException('User is already registered and setup.');
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      user!.passwordHash = passwordHash;
      user!.isRegistered = true;
      await this.userService.save(user!);

      delete this.tempUser[mobileNumber]; // Clear temp status

      return { message: 'Password set successfully. You can now login.' };
    } catch (e) {
      throw e;
    }
  }

  // --- Feature 1: Login ---
  async login(mobileNumber: string, pass: string) {
    const user = await this.userService.findOneByMobile(mobileNumber);

    if (!user?.isRegistered) {
      throw new UnauthorizedException(
        'User not fully registered. Please verify OTP and set a password.',
      );
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid mobile number or password.');
    }

    const payload: JwtPayload = { userId: user.id, mobileNumber: user.mobileNumber };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}