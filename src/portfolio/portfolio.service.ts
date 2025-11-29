import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TradeSide } from '@prisma/client';
import { PriceService } from './price.service';

@Injectable()
export class PortfolioService {
  constructor(
    private prisma: PrismaService,
    private priceService: PriceService,
  ) {}

  async calculateHoldings(userId: string) {
    // 1. Get all trades for user
    const trades = await this.prisma.trade.findMany({
      where: { userId },
      orderBy: { executedAt: 'asc' },
    });

    // 2. Group by brokerAccount and symbol
    const holdingsMap = new Map<string, { quantity: number; costBasis: number }>();

    for (const trade of trades) {
      const key = `${trade.brokerAccountId}:${trade.symbol}`;
      if (!holdingsMap.has(key)) {
        holdingsMap.set(key, { quantity: 0, costBasis: 0 });
      }

      const position = holdingsMap.get(key);
      const quantity = Number(trade.quantity);
      const price = Number(trade.price);

      if (trade.side === TradeSide.BUY) {
        // Update average cost
        const totalCost = position.quantity * position.costBasis + quantity * price;
        position.quantity += quantity;
        position.costBasis = position.quantity > 0 ? totalCost / position.quantity : 0;
      } else {
        // Sell reduces quantity but doesn't change cost basis per share (FIFO/Avg Cost assumption)
        position.quantity -= quantity;
      }
    }

    // 3. Update Holdings in DB
    for (const [key, position] of holdingsMap.entries()) {
      const [brokerAccountId, symbol] = key.split(':');
      
      const currentPrice = await this.priceService.getPrice(symbol, position.costBasis);
      const marketValue = position.quantity * currentPrice;

      if (position.quantity > 0) {
        await this.prisma.holding.upsert({
          where: {
            brokerAccountId_symbol: {
              brokerAccountId,
              symbol,
            },
          },
          update: {
            quantity: position.quantity,
            averagePrice: position.costBasis,
            marketValue: marketValue,
          },
          create: {
            userId,
            brokerAccountId,
            symbol,
            quantity: position.quantity,
            averagePrice: position.costBasis,
            marketValue: marketValue,
          },
        });
      } else {
        // Remove holding if quantity is 0
        await this.prisma.holding.deleteMany({
          where: {
            brokerAccountId,
            symbol,
          },
        });
      }
    }

    return this.getHoldings(userId);
  }

  async getHoldings(userId: string) {
    return this.prisma.holding.findMany({
      where: { userId },
    });
  }

  async getPortfolioSummary(userId: string) {
    const holdings = await this.getHoldings(userId);
    const totalValue = holdings.reduce((sum, h) => sum + Number(h.marketValue), 0);
    const costBasis = holdings.reduce((sum, h) => sum + Number(h.averagePrice) * Number(h.quantity), 0);
    const totalGainLoss = totalValue - costBasis;
    const totalReturnPct = costBasis > 0 ? totalGainLoss / costBasis : 0;
    return {
      totalValue,
      totalGainLoss,
      totalReturnPct,
      holdingsCount: holdings.length,
    };
  }

  async createEquitySnapshot(userId: string, asOf: Date = new Date()) {
    const summary = await this.getPortfolioSummary(userId);
    return this.prisma.equitySnapshot.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(asOf.toDateString()),
        },
      },
      update: {
        equity: summary.totalValue,
      },
      create: {
        userId,
        date: new Date(asOf.toDateString()),
        equity: summary.totalValue,
      },
    });
  }
}
