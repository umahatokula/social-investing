import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('leaderboard')
@Controller('leaderboard')
@UseGuards(AuthGuard('jwt'))
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  async getLeaderboard(@Query('limit') limit: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.leaderboardService.getTopPerformers(limitNum);
  }
}
