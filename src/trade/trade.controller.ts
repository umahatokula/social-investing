import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { TradeService } from './trade.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TradeDto } from './dto/trade.dto';

@ApiTags('trades')
@Controller('trades')
@UseGuards(AuthGuard('jwt'))
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @ApiOperation({ summary: 'Sync trades', description: 'Fetches trades from connected brokerages.' })
  @ApiResponse({ status: 201, description: 'List of synced trades', type: [TradeDto] })
  @Post('sync')
  async syncTrades(@Request() req) {
    return this.tradeService.syncTradesForUser(req.user.userId);
  }

  @ApiOperation({ summary: 'Get trades', description: 'Retrieves trade history.' })
  @ApiResponse({ status: 200, description: 'List of trades', type: [TradeDto] })
  @Get()
  async getTrades(@Request() req) {
    return this.tradeService.getTrades(req.user.userId);
  }
}
