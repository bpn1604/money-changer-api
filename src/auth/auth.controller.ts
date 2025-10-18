import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

import { IsMobilePhone, IsString, Length, Matches } from 'class-validator';
import { LoginDto, RegisterDto, SetPasswordDto, VerifyOtpDto } from './dto/auth.dto';

// --- DTOs (Data Transfer Objects) for Auth Requests ---
// Note: Normally DTOs are in a separate `dto` folder, but keeping them here for brevity.

// export class RegisterDto {
//   @IsMobilePhone('en-IN')
//   mobileNumber: string;
// }

// export class VerifyOtpDto extends RegisterDto {
//   @Matches(/^[0-9]{4}$/, { message: 'OTP must be a 4-digit number.' })
//   otp: string;
// }

// export class SetPasswordDto extends RegisterDto {
//   @IsString()
//   @Length(6, 30, { message: 'Password must be between 6 and 30 characters.' })
//   password: string;
// }

// export class LoginDto extends SetPasswordDto {}
// --- End DTOs ---

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.mobileNumber);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.mobileNumber, body.otp);
  }

  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  async setPassword(@Body() body: SetPasswordDto) {
    return this.authService.setPassword(body.mobileNumber, body.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.mobileNumber, body.password);
  }
}