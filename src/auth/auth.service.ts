import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async generateToken(userId: number): Promise<string> {
    const user = await this.userService.findOne(userId);

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
