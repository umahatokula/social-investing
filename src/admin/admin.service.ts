import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async banUser(userId: string, actorId?: string) {
    let user;
    try {
      user = await this.prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.BANNED },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw err;
    }
    if (actorId) {
      await this.prisma.adminAuditLog.create({
        data: {
          actorId,
          action: 'BAN_USER',
          targetId: userId,
        },
      });
    }
    return user;
  }

  async unbanUser(userId: string, actorId?: string) {
    let user;
    try {
      user = await this.prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.ACTIVE },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw err;
    }
    if (actorId) {
      await this.prisma.adminAuditLog.create({
        data: {
          actorId,
          action: 'UNBAN_USER',
          targetId: userId,
        },
      });
    }
    return user;
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
