import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { BrokerageModule } from '../brokerage/brokerage.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [BrokerageModule, ActivityModule],
  providers: [TradeService],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}
