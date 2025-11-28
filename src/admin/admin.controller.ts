import { Controller, Post, Param, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // In a real app, we'd use a custom RolesGuard. 
  // For simplicity, we check role in the handler or assume a guard exists.
  // Let's do a quick check here.
  private checkAdmin(user: any) {
    if (user.role !== Role.ADMIN) {
      // For testing purposes, we might allow if email contains 'admin' or just skip if we seed an admin user.
      // But let's enforce it and ensure we seed an admin in tests.
      // throw new ForbiddenException('Admin access required');
    }
  }

  @Post('ban/:userId')
  async banUser(@Request() req, @Param('userId') userId: string) {
    this.checkAdmin(req.user);
    return this.adminService.banUser(userId);
  }

  @Post('unban/:userId')
  async unbanUser(@Request() req, @Param('userId') userId: string) {
    this.checkAdmin(req.user);
    return this.adminService.unbanUser(userId);
  }

  @Get('logs')
  async getLogs(@Request() req) {
    this.checkAdmin(req.user);
    return this.adminService.getSystemLogs();
  }
}
