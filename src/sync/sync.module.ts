import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { TradeModule } from '../trade/trade.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [TradeModule, PortfolioModule, PerformanceModule],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
