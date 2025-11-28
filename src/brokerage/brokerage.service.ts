import { Injectable } from '@nestjs/common';
import { BrokerageProviderRegistry } from './registry/brokerage-provider.registry';
import { PrismaService } from '../prisma/prisma.service';
import { BrokerType } from '@prisma/client';

@Injectable()
export class BrokerageService {
  constructor(
    private registry: BrokerageProviderRegistry,
    private prisma: PrismaService,
  ) {}

  async connectAccount(userId: string, brokerName: string, credentials?: any) {
    const provider = this.registry.getProvider(brokerName);
    // In a real app, we would validate credentials with the provider here
    // For now, we just create the account record
    
    // Fetch accounts from provider to verify and get details
    // const accounts = await provider.fetchAccounts({} as any); 

    return this.prisma.brokerAccount.create({
      data: {
        userId,
        brokerName,
        brokerType: BrokerType.STOCK, // Default for now, should come from provider or input
        accessTokenEnc: 'mock-token', // Should be encrypted
      },
    });
  }

  async getAccounts(userId: string) {
    return this.prisma.brokerAccount.findMany({
      where: { userId },
    });
  }
}
