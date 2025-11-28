import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [PortfolioModule],
  providers: [PerformanceService],
  controllers: [PerformanceController],
  exports: [PerformanceService],
})
export class PerformanceModule {}
