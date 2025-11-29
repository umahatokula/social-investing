import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TradeSide } from '@prisma/client';

@Injectable()
export class PerformanceService {
  constructor(
    private prisma: PrismaService,
    private portfolioService: PortfolioService,
  ) {}

  async calculateMetrics(userId: string) {
    const summary = await this.portfolioService.getPortfolioSummary(userId);
    await this.portfolioService.createEquitySnapshot(userId);

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const snapshots = await this.prisma.equitySnapshot.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 2,
    });
    const latestEquity = summary.totalValue;
    const previousEquity = snapshots[1]?.equity ?? summary.totalValue;
    const equityStartYear =
      (
        await this.prisma.equitySnapshot.findFirst({
          where: { userId, date: { gte: startOfYear } },
          orderBy: { date: 'asc' },
        })
      )?.equity ?? latestEquity;

    // Basic win/loss metrics based on closed trades
    const closedTrades = await this.prisma.trade.findMany({
      where: { userId },
      orderBy: { executedAt: 'desc' },
    });
    const pnl = closedTrades.map((t) =>
      (t.side === TradeSide.SELL ? 1 : -1) * Number(t.price) * Number(t.quantity),
    );
    const wins = pnl.filter((p) => p > 0);
    const losses = pnl.filter((p) => p < 0);

    const totalReturn = summary.totalReturnPct;
    const ytdReturn = equityStartYear > 0 ? (latestEquity - Number(equityStartYear)) / Number(equityStartYear) : 0;
    const dailyReturn = previousEquity > 0 ? (latestEquity - Number(previousEquity)) / Number(previousEquity) : 0;

    const winRate = closedTrades.length ? wins.length / closedTrades.length : 0;
    const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
    const profitFactor =
      losses.reduce((a, b) => a + Math.abs(b), 0) === 0
        ? wins.reduce((a, b) => a + b, 0) > 0
          ? Number.POSITIVE_INFINITY
          : 0
        : wins.reduce((a, b) => a + b, 0) / losses.reduce((a, b) => a + Math.abs(b), 0);

    // Rough risk score based on drawdown and volatility
    const maxDrawdown = await this.computeMaxDrawdown(userId);
    const riskScore = this.deriveRiskScore(maxDrawdown, dailyReturn);

    const metric = await this.prisma.performanceMetric.create({
      data: {
        userId,
        totalReturn,
        ytdReturn,
        dailyReturn,
        winRate,
        avgWin,
        avgLoss,
        profitFactor: Number.isFinite(profitFactor) ? profitFactor : 0,
        maxDrawdown,
        riskScore,
      },
    });

    await this.upsertMonthlyReturn(userId, summary.totalReturnPct);
    return metric;
  }

  async getMetrics(userId: string) {
    return this.prisma.performanceMetric.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async computeMaxDrawdown(userId: string): Promise<number> {
    const snapshots = await this.prisma.equitySnapshot.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
    let peak = 0;
    let maxDrawdown = 0;
    for (const snap of snapshots) {
      const equity = Number(snap.equity);
      peak = Math.max(peak, equity);
      if (peak > 0) {
        const dd = (equity - peak) / peak;
        maxDrawdown = Math.min(maxDrawdown, dd);
      }
    }
    return maxDrawdown;
  }

  private deriveRiskScore(maxDrawdown: number, dailyReturn: number): number {
    if (maxDrawdown > -0.05 && dailyReturn > 0.01) return 5;
    if (maxDrawdown > -0.1) return 4;
    if (maxDrawdown > -0.2) return 3;
    if (maxDrawdown > -0.3) return 2;
    return 1;
  }

  private async upsertMonthlyReturn(userId: string, returnPct: number) {
    const now = new Date();
    await this.prisma.monthlyReturn.upsert({
      where: {
        userId_year_month: {
          userId,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
      update: {
        returnPct,
      },
      create: {
        userId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        returnPct,
      },
    });
  }
}
