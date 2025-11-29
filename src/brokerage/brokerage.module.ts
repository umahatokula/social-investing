import { Module, OnModuleInit } from '@nestjs/common';
import { BrokerageService } from './brokerage.service';
import { BrokerageController } from './brokerage.controller';
import { BrokerageProviderRegistry } from './registry/brokerage-provider.registry';
import { FakeBrokerageProvider } from './providers/fake-brokerage.provider';
import { FinnhubDemoProvider } from './providers/finnhub-demo.provider';

@Module({
  providers: [BrokerageService, BrokerageProviderRegistry, FakeBrokerageProvider, FinnhubDemoProvider],
  controllers: [BrokerageController],
  exports: [BrokerageService, BrokerageProviderRegistry],
})
export class BrokerageModule implements OnModuleInit {
  constructor(
    private registry: BrokerageProviderRegistry,
    private fakeProvider: FakeBrokerageProvider,
    private finnhubProvider: FinnhubDemoProvider,
  ) {}

  onModuleInit() {
    this.registry.registerProvider('fake', this.fakeProvider);
    this.registry.registerProvider('finnhub-demo', this.finnhubProvider);
  }
}
