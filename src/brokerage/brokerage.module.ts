import { Module, OnModuleInit } from '@nestjs/common';
import { BrokerageService } from './brokerage.service';
import { BrokerageController } from './brokerage.controller';
import { BrokerageProviderRegistry } from './registry/brokerage-provider.registry';
import { FakeBrokerageProvider } from './providers/fake-brokerage.provider';

@Module({
  providers: [BrokerageService, BrokerageProviderRegistry, FakeBrokerageProvider],
  controllers: [BrokerageController],
  exports: [BrokerageService, BrokerageProviderRegistry],
})
export class BrokerageModule implements OnModuleInit {
  constructor(
    private registry: BrokerageProviderRegistry,
    private fakeProvider: FakeBrokerageProvider,
  ) {}

  onModuleInit() {
    this.registry.registerProvider('fake', this.fakeProvider);
  }
}
