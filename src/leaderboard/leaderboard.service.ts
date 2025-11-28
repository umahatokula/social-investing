import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getTopPerformers(limit: number = 10) {
    // Fetch latest performance metric for each user
    // In a real app, we might have a dedicated Leaderboard table or materialized view
    // For now, we'll query PerformanceMetric and join with User
    
    // Since we don't have a direct way to get "latest per user" easily in one Prisma query without raw SQL or grouping tricks that might be complex,
    // we will fetch all metrics, sort by totalReturn desc, and deduplicate by user in application logic (not efficient for large scale but fine for MVP)
    // OR: We can rely on the fact that we just created one metric per user in our flow.
    
    const metrics = await this.prisma.performanceMetric.findMany({
      take: 100, // Fetch more to allow for deduplication if needed
      orderBy: { totalReturn: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            alias: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Deduplicate by userId (keep first/highest)
    const uniqueMetrics = [];
    const seenUsers = new Set<string>();

    for (const metric of metrics) {
      if (!seenUsers.has(metric.userId)) {
        seenUsers.add(metric.userId);
        uniqueMetrics.push(metric);
        if (uniqueMetrics.length >= limit) break;
      }
    }

    return uniqueMetrics.map(m => ({
      userId: m.userId,
      alias: m.user.alias,
      totalReturn: m.totalReturn,
      riskScore: m.riskScore,
    }));
  }
}
