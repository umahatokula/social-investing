import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('performance')
@UseGuards(AuthGuard('jwt'))
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post('calculate')
  async calculateMetrics(@Request() req) {
    return this.performanceService.calculateMetrics(req.user.userId);
  }

  @Get()
  async getMetrics(@Request() req) {
    return this.performanceService.getMetrics(req.user.userId);
  }
}
