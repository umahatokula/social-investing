import { Injectable } from '@nestjs/common';
import { IBrokerageProvider, ExternalBrokerAccount, ExternalTrade, ExternalHolding, ExternalCashBalance } from '../interfaces/brokerage-provider.interface';
import { User, BrokerAccount } from '@prisma/client';

@Injectable()
export class FakeBrokerageProvider implements IBrokerageProvider {
  getAuthType(): 'OAUTH' | 'API_KEY' | 'SESSION' | 'NONE' {
    return 'NONE';
  }

  async fetchAccounts(user: User): Promise<ExternalBrokerAccount[]> {
    return [
      {
        accountId: 'fake-acc-1',
        name: 'Fake Broker Account',
        type: 'STOCK',
        cashBalance: 10000,
      },
    ];
  }

  async fetchTrades(account: BrokerAccount, since?: Date): Promise<ExternalTrade[]> {
    return [
      {
        externalId: 'fake-trade-1',
        symbol: 'AAPL',
        side: 'BUY',
        quantity: 10,
        price: 150.0,
        executedAt: new Date(),
        assetType: 'EQUITY',
      },
      {
        externalId: 'fake-trade-2',
        symbol: 'TSLA',
        side: 'SELL',
        quantity: 5,
        price: 200.0,
        executedAt: new Date(),
        assetType: 'EQUITY',
      },
    ];
  }

  async fetchHoldings(account: BrokerAccount): Promise<ExternalHolding[]> {
    return [
      {
        symbol: 'AAPL',
        quantity: 10,
        averagePrice: 150.0,
        marketValue: 1550.0, // Current price 155
      },
    ];
  }

  async fetchCashBalance(account: BrokerAccount): Promise<ExternalCashBalance> {
    return {
      amount: 5000,
      currency: 'USD',
    };
  }
}
