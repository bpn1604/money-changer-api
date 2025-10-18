// src/auth/dto/auth.dto.ts

import { IsMobilePhone, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsMobilePhone('en-IN')
  mobileNumber: string;
}

export class VerifyOtpDto extends RegisterDto {
  @Matches(/^[0-9]{4}$/, { message: 'OTP must be a 4-digit number.' })
  otp: string;
}

export class SetPasswordDto extends RegisterDto {
  @IsString()
  @Length(6, 30, { message: 'Password must be between 6 and 30 characters.' })
  password: string;
}

export class LoginDto extends SetPasswordDto {}