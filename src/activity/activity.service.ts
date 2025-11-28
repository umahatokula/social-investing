import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(userId: string, type: string, data: any) {
    return this.prisma.activity.create({
      data: {
        userId,
        type,
        data,
      },
    });
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
}
