import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BrokerageService } from '../brokerage/brokerage.service';
import { AssetType, TradeSide } from '@prisma/client';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class TradeService {
  constructor(
    private prisma: PrismaService,
    private brokerageService: BrokerageService,
    private activityService: ActivityService,
  ) {}

  async syncTradesForUser(userId: string) {
    const accounts = await this.brokerageService.getAccounts(userId);
    const results = [];

    for (const account of accounts) {
      try {
        const syncResult = await this.brokerageService.syncAccount(account.id);
        // Fetch latest trades per account to push into results list
        const syncedTrades = await this.prisma.trade.findMany({
          where: { brokerAccountId: account.id },
          orderBy: { executedAt: 'desc' },
          take: syncResult.trades,
        });
        for (const trade of syncedTrades) {
          await this.activityService.logActivity(account.userId, 'TRADE_SYNCED', {
            tradeId: trade.id,
            symbol: trade.symbol,
          });
          results.push(trade);
        }
      } catch (error) {
        console.error(`Failed to sync trades for account ${account.id}:`, error);
        // Continue to next account
      }
    }
    return results;
  }

  async getTrades(userId: string) {
    return this.prisma.trade.findMany({
      where: { userId },
      orderBy: { executedAt: 'desc' },
    });
  }
}
