import { Controller, Put, Param } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('block')
export class BlockController {
  constructor(private readonly userService: UserService) {}

  @Put(':userId/block/:blockedUserId')
  async blockUser(
    @Param('userId') userId: number,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.userService.blockUser(userId, parseInt(blockedUserId, 10));
  }

  @Put(':userId/unblock/:blockedUserId')
  async unblockUser(
    @Param('userId') userId: number,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.userService.unblockUser(userId, parseInt(blockedUserId, 10));
  }
}
