import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PerformanceMetricDto } from './dto/performance.dto';

@ApiTags('performance')
@Controller('performance')
@UseGuards(AuthGuard('jwt'))
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @ApiOperation({ summary: 'Calculate performance metrics', description: 'Triggers a calculation of performance metrics for the user.' })
  @ApiResponse({ status: 201, description: 'The calculated metrics', type: PerformanceMetricDto })
  @Post('calculate')
  async calculateMetrics(@Request() req) {
    return this.performanceService.calculateMetrics(req.user.userId);
  }

  @ApiOperation({ summary: 'Get latest performance metrics', description: 'Retrieves the latest performance metrics for the user.' })
  @ApiResponse({ status: 200, description: 'The latest metrics', type: PerformanceMetricDto })
  @Get()
  async getMetrics(@Request() req) {
    return this.performanceService.getMetrics(req.user.userId);
  }
}
