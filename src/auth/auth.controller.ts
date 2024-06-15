import { Controller, Get, Query, NotFoundException } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('token')
  async getToken(@Query('userId') userId: number): Promise<{ token: string }> {
    try {
      const token = await this.authService.generateToken(userId);
      return { token };
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }
}
