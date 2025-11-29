import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getTopPerformers(limit: number = 10) {
    const metrics = await this.prisma.$queryRaw<
      Array<{ userId: string; totalReturn: number; riskScore: number; alias: string | null }>
    >`
      SELECT DISTINCT ON (pm."userId")
        pm."userId",
        pm."totalReturn",
        pm."riskScore",
        u."alias"
      FROM "PerformanceMetric" pm
      JOIN "User" u ON u.id = pm."userId"
      WHERE u.status = 'ACTIVE'
      ORDER BY pm."userId", pm."createdAt" DESC, pm."totalReturn" DESC
      LIMIT ${limit}
    `;

    return metrics
      .sort((a, b) => Number(b.totalReturn) - Number(a.totalReturn))
      .map((m) => ({
        userId: m.userId,
        alias: m.alias,
        totalReturn: Number(m.totalReturn),
        riskScore: Number(m.riskScore),
      }));
  }
}
