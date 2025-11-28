import { User, BrokerAccount } from '@prisma/client';

export interface ExternalBrokerAccount {
  accountId: string;
  name: string;
  type: string; // STOCK, CRYPTO, etc.
  cashBalance?: number;
}

export interface ExternalTrade {
  externalId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  executedAt: Date;
  assetType: string;
}

export interface ExternalHolding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  marketValue: number;
}

export interface ExternalCashBalance {
  amount: number;
  currency: string;
}

export interface IBrokerageProvider {
  getAuthType(): 'OAUTH' | 'API_KEY' | 'SESSION' | 'NONE';
  
  fetchAccounts(user: User, credentials?: any): Promise<ExternalBrokerAccount[]>;
  
  fetchTrades(
    account: BrokerAccount,
    since?: Date,
  ): Promise<ExternalTrade[]>;
  
  fetchHoldings(
    account: BrokerAccount,
  ): Promise<ExternalHolding[]>;
  
  fetchCashBalance(
    account: BrokerAccount,
  ): Promise<ExternalCashBalance>;
}
