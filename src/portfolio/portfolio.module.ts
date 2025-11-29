import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PriceService } from './price.service';

@Module({
  providers: [PortfolioService, PriceService],
  controllers: [PortfolioController],
  exports: [PortfolioService],
})
export class PortfolioModule {}
