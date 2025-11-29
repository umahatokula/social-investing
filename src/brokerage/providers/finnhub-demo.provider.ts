import { Injectable, Logger } from '@nestjs/common';
import {
  IBrokerageProvider,
  ExternalBrokerAccount,
  ExternalTrade,
  ExternalHolding,
  ExternalCashBalance,
} from '../interfaces/brokerage-provider.interface';
import { BrokerAccount, User } from '@prisma/client';

// Read-only demo provider that simulates a Canadian-accessible broker.
// Uses Finnhub (free tier) for live price lookups when FINNHUB_API_KEY is set,
// but returns static account/trade/holding data for predictable tests.
@Injectable()
export class FinnhubDemoProvider implements IBrokerageProvider {
  private readonly logger = new Logger(FinnhubDemoProvider.name);

  getAuthType(): 'OAUTH' | 'API_KEY' | 'SESSION' | 'NONE' {
    return 'API_KEY';
  }

  async fetchAccounts(user: User): Promise<ExternalBrokerAccount[]> {
    // Single simulated account per user for demo purposes.
    return [
      {
        accountId: `finnhub-${user.id}`,
        name: 'Finnhub Demo',
        type: 'STOCK',
        cashBalance: 25000,
      },
    ];
  }

  async fetchTrades(account: BrokerAccount, since?: Date): Promise<ExternalTrade[]> {
    const now = new Date();
    const baseTrades: ExternalTrade[] = [
      {
        externalId: `${account.id}-shop-${since ? 'recent' : 'init'}`,
        symbol: 'SHOP.TO',
        side: 'BUY',
        quantity: 5,
        price: 80.5,
        executedAt: since ?? now,
        assetType: 'EQUITY',
      },
      {
        externalId: `${account.id}-ry-${since ? 'recent' : 'init'}`,
        symbol: 'RY.TO',
        side: 'BUY',
        quantity: 8,
        price: 120.3,
        executedAt: since ?? now,
        assetType: 'EQUITY',
      },
    ];
    return baseTrades;
  }

  async fetchHoldings(account: BrokerAccount): Promise<ExternalHolding[]> {
    const symbols = ['SHOP.TO', 'RY.TO'];
    const quotes = await this.getQuotes(symbols);
    return [
      {
        symbol: 'SHOP.TO',
        quantity: 5,
        averagePrice: 80.5,
        marketValue: (quotes['SHOP.TO'] ?? 80.5) * 5,
      },
      {
        symbol: 'RY.TO',
        quantity: 8,
        averagePrice: 120.3,
        marketValue: (quotes['RY.TO'] ?? 120.3) * 8,
      },
    ];
  }

  async fetchCashBalance(account: BrokerAccount): Promise<ExternalCashBalance> {
    return {
      amount: 25000,
      currency: 'CAD',
    };
  }

  private async getQuotes(symbols: string[]): Promise<Record<string, number>> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return {};
    }

    const results: Record<string, number> = {};
    for (const symbol of symbols) {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data?.c) {
          results[symbol] = Number(data.c);
        }
      } catch (err) {
        this.logger.warn(`Quote fetch failed for ${symbol}: ${err}`);
      }
    }
    return results;
  }
}
