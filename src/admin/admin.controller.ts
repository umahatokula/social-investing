import { Controller, Post, Param, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { AdminGuard } from './admin.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // In a real app, we'd use a custom RolesGuard. 
  // For simplicity, we check role in the handler or assume a guard exists.
  // Let's do a quick check here.
  private checkAdmin(user: any) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }

  @ApiParam({ name: 'userId', type: String })
  @Post('ban/:userId')
  async banUser(@Request() req, @Param('userId') userId: string) {
    this.checkAdmin(req.user);
    return this.adminService.banUser(userId, req.user.userId);
  }

  @ApiParam({ name: 'userId', type: String })
  @Post('unban/:userId')
  async unbanUser(@Request() req, @Param('userId') userId: string) {
    this.checkAdmin(req.user);
    return this.adminService.unbanUser(userId, req.user.userId);
  }

  @Get('logs')
  async getLogs(@Request() req) {
    this.checkAdmin(req.user);
    return this.adminService.getSystemLogs();
  }
}
