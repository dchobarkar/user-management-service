import { Controller, Put, Param, ParseIntPipe } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('block')
export class BlockController {
  constructor(private readonly userService: UserService) {}

  @Put(':userId/block/:blockedUserId')
  async blockUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    return this.userService.blockUser(userId, blockedUserId);
  }

  @Put(':userId/unblock/:blockedUserId')
  async unblockUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('blockedUserId', ParseIntPipe) blockedUserId: number,
  ) {
    return this.userService.unblockUser(userId, blockedUserId);
  }
}
