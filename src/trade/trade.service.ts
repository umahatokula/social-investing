import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BrokerageService } from '../brokerage/brokerage.service';
import { BrokerageProviderRegistry } from '../brokerage/registry/brokerage-provider.registry';
import { AssetType, TradeSide } from '@prisma/client';

@Injectable()
export class TradeService {
  constructor(
    private prisma: PrismaService,
    private brokerageService: BrokerageService,
    private registry: BrokerageProviderRegistry,
  ) {}

  async syncTradesForUser(userId: string) {
    const accounts = await this.brokerageService.getAccounts(userId);
    const results = [];

    for (const account of accounts) {
      try {
        const provider = this.registry.getProvider(account.brokerName);
        const trades = await provider.fetchTrades(account);

        for (const trade of trades) {
          // Upsert trade to avoid duplicates
          const savedTrade = await this.prisma.trade.upsert({
            where: {
              brokerAccountId_externalTradeId: {
                brokerAccountId: account.id,
                externalTradeId: trade.externalId,
              },
            },
            update: {}, // No update if exists
            create: {
              userId: account.userId,
              brokerAccountId: account.id,
              externalTradeId: trade.externalId,
              symbol: trade.symbol,
              assetType: trade.assetType as AssetType, // Ensure enum match
              side: trade.side as TradeSide,
              quantity: trade.quantity,
              price: trade.price,
              executedAt: trade.executedAt,
            },
          });
          results.push(savedTrade);
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
