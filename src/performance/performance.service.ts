import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class PerformanceService {
  constructor(
    private prisma: PrismaService,
    private portfolioService: PortfolioService,
  ) {}

  async calculateMetrics(userId: string) {
    // 1. Get current portfolio value
    const portfolio = await this.portfolioService.getPortfolioSummary(userId);
    const currentValue = portfolio.totalValue;

    // 2. Calculate simple metrics (Mock logic for now as we need historical data for real calc)
    // In a real app, we would query historical snapshots
    const totalReturn = currentValue > 0 ? 0.15 : 0; // Mock 15% return
    const ytdReturn = currentValue > 0 ? 0.10 : 0;   // Mock 10% YTD
    const dailyReturn = currentValue > 0 ? 0.01 : 0; // Mock 1% daily

    // 3. Store metrics
    return this.prisma.performanceMetric.create({
      data: {
        userId,
        totalReturn,
        ytdReturn,
        dailyReturn,
        winRate: 0.6, // Mock
        avgWin: 500,
        avgLoss: 200,
        profitFactor: 1.5,
        maxDrawdown: -0.05,
        riskScore: 3,
      },
    });
  }

  async getMetrics(userId: string) {
    return this.prisma.performanceMetric.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
