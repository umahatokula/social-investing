import { Module, OnModuleInit } from '@nestjs/common';
import { BrokerageService } from './brokerage.service';
import { BrokerageController } from './brokerage.controller';
import { BrokerageProviderRegistry } from './registry/brokerage-provider.registry';
import { FinnhubDemoProvider } from './providers/finnhub-demo.provider';
import { AlpacaProvider } from './providers/alpaca.provider';

@Module({
  providers: [BrokerageService, BrokerageProviderRegistry, FinnhubDemoProvider, AlpacaProvider],
  controllers: [BrokerageController],
  exports: [BrokerageService, BrokerageProviderRegistry],
})
export class BrokerageModule implements OnModuleInit {
  constructor(
    private registry: BrokerageProviderRegistry,
    private finnhubProvider: FinnhubDemoProvider,
    private alpacaProvider: AlpacaProvider,
  ) {}

  onModuleInit() {
    // Register demo provider only outside production; production should register real brokers explicitly.
    if (process.env.NODE_ENV !== 'production') {
      this.registry.registerProvider('finnhub-demo', this.finnhubProvider);
    }
    // Register Alpaca for production usage
    this.registry.registerProvider('alpaca', this.alpacaProvider);
  }
}
