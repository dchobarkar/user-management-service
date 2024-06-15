import { Controller, Get, Query } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('token')
  getToken(@Query('userId') userId: number): { token: string } {
    const token = this.authService.generateToken(userId);
    return { token };
  }
}
