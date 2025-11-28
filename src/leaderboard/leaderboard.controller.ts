import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('leaderboard')
@UseGuards(AuthGuard('jwt'))
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query('limit') limit: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.leaderboardService.getTopPerformers(limitNum);
  }
}
