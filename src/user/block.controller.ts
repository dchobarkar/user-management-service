import { Controller, Put, Param, Req, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';

import { UserService } from './user.service';

@Controller('block')
export class BlockController {
  constructor(private readonly userService: UserService) {}

  @Put('/:blockedUserId')
  async blockUser(
    @Req() req: Request,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    const userId = req['user'].id;
    return this.userService.blockUser(userId, blockedUserId);
  }

  @Put('/:blockedUserId/unblock')
  async unblockUser(
    @Req() req: Request,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    const userId = req['user'].id;
    return this.userService.unblockUser(userId, blockedUserId);
  }
}
