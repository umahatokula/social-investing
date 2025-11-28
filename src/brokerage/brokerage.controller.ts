import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { BrokerageService } from './brokerage.service';
import { AuthGuard } from '@nestjs/passport';
import { ConnectBrokerageDto } from './dto/brokerage.dto';

@Controller('brokerage')
@UseGuards(AuthGuard('jwt'))
export class BrokerageController {
  constructor(private readonly brokerageService: BrokerageService) {}

  @Post('connect')
  connectAccount(@Request() req, @Body() dto: ConnectBrokerageDto) {
    return this.brokerageService.connectAccount(req.user.userId, dto.brokerName, dto.credentials);
  }

  @Get('accounts')
  getAccounts(@Request() req) {
    return this.brokerageService.getAccounts(req.user.userId);
  }
}
