import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('portfolio')
@UseGuards(AuthGuard('jwt'))
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('sync')
  async syncHoldings(@Request() req) {
    return this.portfolioService.calculateHoldings(req.user.userId);
  }

  @Get('holdings')
  async getHoldings(@Request() req) {
    return this.portfolioService.getHoldings(req.user.userId);
  }

  @Get('summary')
  async getSummary(@Request() req) {
    return this.portfolioService.getPortfolioSummary(req.user.userId);
  }
}
