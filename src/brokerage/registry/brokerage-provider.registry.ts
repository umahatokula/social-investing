import { Injectable } from '@nestjs/common';
import { IBrokerageProvider } from '../interfaces/brokerage-provider.interface';

@Injectable()
export class BrokerageProviderRegistry {
  private providers: Record<string, IBrokerageProvider> = {};

  registerProvider(brokerName: string, provider: IBrokerageProvider) {
    this.providers[brokerName] = provider;
  }

  getProvider(brokerName: string): IBrokerageProvider {
    const provider = this.providers[brokerName];
    if (!provider) {
      throw new Error(`Brokerage provider not found for: ${brokerName}`);
    }
    return provider;
  }
}
