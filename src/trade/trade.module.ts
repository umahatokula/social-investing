import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { BrokerageModule } from '../brokerage/brokerage.module';

@Module({
  imports: [BrokerageModule],
  providers: [TradeService],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}
