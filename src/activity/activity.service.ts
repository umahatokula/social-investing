import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(userId: string, type: string, data: any, notifyFollowers = false) {
    const activity = await this.prisma.activity.create({
      data: {
        userId,
        type,
        data,
      },
    });

    if (notifyFollowers) {
      const followers = await this.prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      });

      for (const follower of followers) {
        await this.createNotification(follower.followerId, type, data);
      }
    }

    return activity;
  }

  async getFeed(userId: string) {
    // Get activities of users that the current user follows
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    // Also include own activities
    followingIds.push(userId);

    return this.prisma.activity.findMany({
      where: {
        userId: { in: followingIds },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            alias: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      take: 20,
    });
  }

  async getGlobalFeed(limit = 20) {
    return this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            alias: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async createNotification(userId: string, type: string, data: any) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        data,
      },
    });
  }
}
