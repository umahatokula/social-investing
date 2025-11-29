import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  IBrokerageProvider,
  ExternalBrokerAccount,
  ExternalTrade,
  ExternalHolding,
  ExternalCashBalance,
} from '../interfaces/brokerage-provider.interface';
import { BrokerAccount, User } from '@prisma/client';

type AlpacaPosition = {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  market_value: string;
  asset_class: string;
};

type AlpacaActivity = {
  id: string;
  transaction_time: string;
  price: string;
  qty: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: string;
};

type AlpacaAccount = {
  id: string;
  status: string;
  cash: string;
  portfolio_value: string;
};

@Injectable()
export class AlpacaProvider implements IBrokerageProvider {
  private baseUrl: string;
  private dataUrl: string;

  constructor() {
    this.baseUrl = process.env.ALPACA_API_BASE_URL || 'https://paper-api.alpaca.markets';
    this.dataUrl = process.env.ALPACA_DATA_API_BASE_URL || 'https://data.alpaca.markets';
  }

  getAuthType(): 'OAUTH' | 'API_KEY' | 'SESSION' | 'NONE' {
    return 'API_KEY';
  }

  private headers() {
    const key = process.env.ALPACA_API_KEY_ID;
    const secret = process.env.ALPACA_API_SECRET_KEY;
    if (!key || !secret) {
      throw new InternalServerErrorException('Alpaca API credentials missing');
    }
    return {
      'APCA-API-KEY-ID': key,
      'APCA-API-SECRET-KEY': secret,
    };
  }

  async fetchAccounts(user: User): Promise<ExternalBrokerAccount[]> {
    const res = await fetch(`${this.baseUrl}/v2/account`, { headers: this.headers() });
    if (!res.ok) {
      throw new InternalServerErrorException('Failed to fetch Alpaca account');
    }
    const account = (await res.json()) as AlpacaAccount;
    return [
      {
        accountId: account.id,
        name: 'Alpaca Account',
        type: 'STOCK',
        cashBalance: Number(account.cash),
      },
    ];
  }

  async fetchTrades(account: BrokerAccount, since?: Date): Promise<ExternalTrade[]> {
    const params = new URLSearchParams({ activity_types: 'FILL' });
    if (since) {
      params.set('after', since.toISOString());
    }
    const res = await fetch(`${this.baseUrl}/v2/account/activities?${params.toString()}`, {
      headers: this.headers(),
    });
    if (!res.ok) {
      throw new InternalServerErrorException('Failed to fetch Alpaca activities');
    }
    const activities = (await res.json()) as AlpacaActivity[];
    return activities
      .filter((a) => a.type === 'FILL')
      .map((a) => ({
        externalId: a.id,
        symbol: a.symbol,
        side: a.side.toUpperCase() as 'BUY' | 'SELL',
        quantity: Number(a.qty),
        price: Number(a.price),
        executedAt: new Date(a.transaction_time),
        assetType: 'EQUITY',
      }));
  }

  async fetchHoldings(account: BrokerAccount): Promise<ExternalHolding[]> {
    const res = await fetch(`${this.baseUrl}/v2/positions`, { headers: this.headers() });
    if (!res.ok) {
      throw new InternalServerErrorException('Failed to fetch Alpaca positions');
    }
    const positions = (await res.json()) as AlpacaPosition[];
    return positions.map((p) => ({
      symbol: p.symbol,
      quantity: Number(p.qty),
      averagePrice: Number(p.avg_entry_price),
      marketValue: Number(p.market_value),
    }));
  }

  async fetchCashBalance(account: BrokerAccount): Promise<ExternalCashBalance> {
    const res = await fetch(`${this.baseUrl}/v2/account`, { headers: this.headers() });
    if (!res.ok) {
      throw new InternalServerErrorException('Failed to fetch Alpaca account cash');
    }
    const accountInfo = (await res.json()) as AlpacaAccount;
    return {
      amount: Number(accountInfo.cash),
      currency: 'USD',
    };
  }
}
