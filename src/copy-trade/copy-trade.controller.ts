import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { CopyTradeService } from './copy-trade.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('copy-trade')
@UseGuards(AuthGuard('jwt'))
export class CopyTradeController {
  constructor(private readonly copyTradeService: CopyTradeService) {}

  @Post(':tradeId')
  async copyTrade(@Request() req, @Param('tradeId') tradeId: string) {
    return this.copyTradeService.copyTrade(req.user.userId, tradeId);
  }
}
