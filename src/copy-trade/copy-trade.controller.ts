import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { CopyTradeService } from './copy-trade.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('copy-trade')
@Controller('copy-trade')
@UseGuards(AuthGuard('jwt'))
export class CopyTradeController {
  constructor(private readonly copyTradeService: CopyTradeService) {}

  @ApiParam({ name: 'tradeId', type: String })
  @Post(':tradeId')
  async copyTrade(@Request() req, @Param('tradeId') tradeId: string) {
    return this.copyTradeService.copyTrade(req.user.userId, tradeId);
  }
}
