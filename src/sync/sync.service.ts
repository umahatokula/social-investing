import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TradeService } from '../trade/trade.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { PerformanceService } from '../performance/performance.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private tradeService: TradeService,
    private portfolioService: PortfolioService,
    private performanceService: PerformanceService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Starting daily sync...');
    
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
    });

    for (const user of users) {
      try {
        this.logger.log(`Syncing for user ${user.id}`);
        
        // 1. Sync Trades
        await this.tradeService.syncTradesForUser(user.id);
        
        // 2. Calculate Holdings
        await this.portfolioService.calculateHoldings(user.id);
        
        // 3. Calculate Performance Metrics
        await this.performanceService.calculateMetrics(user.id);

        // Log Success
        await this.prisma.syncLog.create({
          data: {
            userId: user.id,
            status: 'SUCCESS',
            message: 'Daily sync completed',
          },
        });
      } catch (error) {
        this.logger.error(`Sync failed for user ${user.id}`, error);
        
        // Log Failure
        await this.prisma.syncLog.create({
          data: {
            userId: user.id,
            status: 'FAILED',
            message: error.message,
          },
        });
      }
    }
    
    this.logger.log('Daily sync finished.');
  }
}
