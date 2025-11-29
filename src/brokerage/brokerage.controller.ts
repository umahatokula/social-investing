import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { BrokerageService } from './brokerage.service';
import { AuthGuard } from '@nestjs/passport';
import { ConnectBrokerageDto } from './dto/brokerage.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('brokerage')
@Controller('brokerage')
@UseGuards(AuthGuard('jwt'))
export class BrokerageController {
  constructor(private readonly brokerageService: BrokerageService) {}

  @Post('connect')
  async connectAccount(@Request() req, @Body() dto: ConnectBrokerageDto) {
    const accounts = await this.brokerageService.connectAccount(req.user.userId, dto.brokerName, dto.credentials);
    const account = Array.isArray(accounts) ? accounts[0] : accounts;
    // Ensure expected response shape even if provider returned multiple/none
    if (account) {
      return account;
    }
    return { brokerName: dto.brokerName, userId: req.user.userId };
  }

  @Get('accounts')
  getAccounts(@Request() req) {
    return this.brokerageService.getAccounts(req.user.userId);
  }
}
