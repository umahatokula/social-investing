import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HoldingDto, PortfolioSummaryDto } from './dto/portfolio.dto';

@ApiTags('portfolio')
@Controller('portfolio')
@UseGuards(AuthGuard('jwt'))
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @ApiOperation({ summary: 'Sync holdings', description: 'Calculates holdings based on trades.' })
  @ApiResponse({ status: 201, description: 'The updated holdings', type: [HoldingDto] })
  @Post('sync')
  async syncHoldings(@Request() req) {
    return this.portfolioService.calculateHoldings(req.user.userId);
  }

  @ApiOperation({ summary: 'Get holdings', description: 'Retrieves current holdings.' })
  @ApiResponse({ status: 200, description: 'List of holdings', type: [HoldingDto] })
  @Get('holdings')
  async getHoldings(@Request() req) {
    return this.portfolioService.getHoldings(req.user.userId);
  }

  @ApiOperation({ summary: 'Get portfolio summary', description: 'Retrieves total value and holding count.' })
  @ApiResponse({ status: 200, description: 'Portfolio summary', type: PortfolioSummaryDto })
  @Get('summary')
  async getSummary(@Request() req) {
    return this.portfolioService.getPortfolioSummary(req.user.userId);
  }
}
