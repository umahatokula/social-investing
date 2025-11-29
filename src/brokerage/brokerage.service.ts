import { Injectable } from '@nestjs/common';
import { BrokerageProviderRegistry } from './registry/brokerage-provider.registry';
import { PrismaService } from '../prisma/prisma.service';
import { AssetType, BrokerType, TradeSide } from '@prisma/client';
import { encrypt } from '../common/crypto.util';
import { ExternalHolding, ExternalTrade } from './interfaces/brokerage-provider.interface';

@Injectable()
export class BrokerageService {
  constructor(
    private registry: BrokerageProviderRegistry,
    private prisma: PrismaService,
  ) {}

  async connectAccount(userId: string, brokerName: string, credentials?: any) {
    const provider = this.registry.getProvider(brokerName);
    const accounts = await provider.fetchAccounts({ id: userId } as any, credentials);

    const created = [];
    for (const account of accounts) {
      const saved = await this.prisma.brokerAccount.upsert({
        where: {
          // assume provider accountId stays stable per user
          id: `${userId}-${brokerName}-${account.accountId}`,
        },
        update: {
          brokerType: this.normalizeBrokerType(account.type),
          accessTokenEnc: credentials ? encrypt(JSON.stringify(credentials)) : null,
          lastSyncedAt: new Date(),
        },
        create: {
          id: `${userId}-${brokerName}-${account.accountId}`,
          userId,
          brokerName,
          brokerType: this.normalizeBrokerType(account.type),
          accessTokenEnc: credentials ? encrypt(JSON.stringify(credentials)) : null,
          lastSyncedAt: new Date(),
        },
      });
      created.push(saved);
    }
    return created;
  }

  async getAccounts(userId: string) {
    return this.prisma.brokerAccount.findMany({
      where: { userId },
    });
  }

  // Sync trades + holdings for an account with normalization/idempotency
  async syncAccount(brokerAccountId: string) {
    const account = await this.prisma.brokerAccount.findUnique({
      where: { id: brokerAccountId },
    });
    if (!account) return { trades: 0, holdings: 0 };
    const provider = this.registry.getProvider(account.brokerName);

    const trades = await provider.fetchTrades(account, account.lastSyncedAt ?? undefined);
    const holdings = await provider.fetchHoldings(account);
    let tradeCount = 0;
    let holdingCount = 0;

    for (const trade of trades) {
      await this.prisma.trade.upsert({
        where: {
          brokerAccountId_externalTradeId: {
            brokerAccountId: account.id,
            externalTradeId: trade.externalId,
          },
        },
        update: {
          price: trade.price,
          quantity: trade.quantity,
          executedAt: trade.executedAt,
        },
        create: {
          userId: account.userId,
          brokerAccountId: account.id,
          externalTradeId: trade.externalId,
          symbol: trade.symbol,
          assetType: this.normalizeAssetType(trade.assetType),
          side: trade.side as TradeSide,
          quantity: trade.quantity,
          price: trade.price,
          executedAt: trade.executedAt,
        },
      });
      tradeCount++;
    }

    for (const holding of holdings) {
      await this.upsertHolding(account.id, account.userId, holding);
      holdingCount++;
    }

    await this.prisma.brokerAccount.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date() },
    });

    return { trades: tradeCount, holdings: holdingCount };
  }

  private normalizeAssetType(value: string): AssetType {
    const upper = (value || '').toUpperCase();
    if (['ETF'].includes(upper)) return AssetType.ETF;
    if (['CRYPTO', 'CRYPTOCURRENCY'].includes(upper)) return AssetType.CRYPTO;
    if (['FOREX', 'FX'].includes(upper)) return AssetType.FOREX;
    if (['FUND', 'MUTUALFUND'].includes(upper)) return AssetType.FUND;
    if (['EQUITY', 'STOCK'].includes(upper)) return AssetType.EQUITY;
    return AssetType.OTHER;
  }

  private normalizeBrokerType(value: string): BrokerType {
    const upper = (value || '').toUpperCase();
    if (upper.includes('CRYPTO')) return BrokerType.CRYPTO;
    if (upper.includes('FOREX')) return BrokerType.FOREX;
    if (upper.includes('STOCK') || upper.includes('EQUITY')) return BrokerType.STOCK;
    return BrokerType.OTHER;
  }

  private async upsertHolding(
    brokerAccountId: string,
    userId: string,
    holding: ExternalHolding,
  ) {
    await this.prisma.holding.upsert({
      where: {
        brokerAccountId_symbol: {
          brokerAccountId,
          symbol: holding.symbol,
        },
      },
      update: {
        quantity: holding.quantity,
        averagePrice: holding.averagePrice,
        marketValue: holding.marketValue,
      },
      create: {
        userId,
        brokerAccountId,
        symbol: holding.symbol,
        quantity: holding.quantity,
        averagePrice: holding.averagePrice,
        marketValue: holding.marketValue,
      },
    });
  }
}
