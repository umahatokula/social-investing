import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { TradeService } from './trade.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trades')
@UseGuards(AuthGuard('jwt'))
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('sync')
  async syncTrades(@Request() req) {
    return this.tradeService.syncTradesForUser(req.user.userId);
  }

  @Get()
  async getTrades(@Request() req) {
    return this.tradeService.getTrades(req.user.userId);
  }
}
