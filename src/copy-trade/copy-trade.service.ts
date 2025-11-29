import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowService } from '../follow/follow.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CopyTradeService {
  constructor(
    private prisma: PrismaService,
    private followService: FollowService,
    private activityService: ActivityService,
  ) {}

  async copyTrade(userId: string, tradeId: string) {
    // 1. Get the trade to copy
    const tradeToCopy = await this.prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!tradeToCopy) {
      throw new NotFoundException('Trade not found');
    }

    // 2. Check if user is following the trader
    const isFollowing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: tradeToCopy.userId,
        },
      },
    });

    if (!isFollowing) {
      throw new BadRequestException('You must follow the trader to copy their trades');
    }

    const session = await this.prisma.copyTradeSession.upsert({
      where: {
        followerId_traderId: {
          followerId: userId,
          traderId: tradeToCopy.userId,
        },
      },
      update: {
        status: 'ACTIVE',
      },
      create: {
        followerId: userId,
        traderId: tradeToCopy.userId,
        allocationPct: 100,
        status: 'ACTIVE',
      },
    });

    // 3. Simulate creating a trade for the copier
    // In a real app, this would place an order with the broker
    // Here we just create a Trade record linked to a mock broker account for the user
    
    // Find or create a mock broker account for the user
    let brokerAccount = await this.prisma.brokerAccount.findFirst({
      where: { userId, brokerName: 'copy-trade-sim' },
    });

    if (!brokerAccount) {
      brokerAccount = await this.prisma.brokerAccount.create({
        data: {
          userId,
          brokerName: 'copy-trade-sim',
          brokerType: 'STOCK', // Mock
        },
      });
    }

    const copiedTrade = await this.prisma.trade.create({
      data: {
        userId,
        brokerAccountId: brokerAccount.id,
        symbol: tradeToCopy.symbol,
        assetType: tradeToCopy.assetType,
        side: tradeToCopy.side,
        quantity: tradeToCopy.quantity,
        price: tradeToCopy.price,
        executedAt: new Date(),
        externalTradeId: `copy-${tradeToCopy.id}-${Date.now()}`,
      },
    });

    await this.prisma.copyTradeExecution.create({
      data: {
        sessionId: session.id,
        sourceTradeId: tradeToCopy.id,
        copiedTradeId: copiedTrade.id,
      },
    });

    await this.activityService.logActivity(userId, 'COPY_TRADE', {
      sourceTradeId: tradeToCopy.id,
      copiedTradeId: copiedTrade.id,
    });

    return copiedTrade;
  }
}
