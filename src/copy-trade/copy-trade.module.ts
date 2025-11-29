import { Module } from '@nestjs/common';
import { CopyTradeService } from './copy-trade.service';
import { CopyTradeController } from './copy-trade.controller';
import { FollowModule } from '../follow/follow.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [FollowModule, ActivityModule],
  providers: [CopyTradeService],
  controllers: [CopyTradeController],
  exports: [CopyTradeService],
})
export class CopyTradeModule {}
