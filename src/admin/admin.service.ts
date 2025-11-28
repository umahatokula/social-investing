import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async banUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BANNED },
    });
  }

  async unbanUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
    });
  }

  async getSystemLogs() {
    return this.prisma.syncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            alias: true,
          },
        },
      },
    });
  }
}
