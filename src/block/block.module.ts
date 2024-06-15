import { Module } from '@nestjs/common';

import { UserModule } from 'src/user/user.module';
import { BlockController } from './block.controller';

@Module({
  imports: [UserModule],
  controllers: [BlockController],
})
export class BlockModule {}
