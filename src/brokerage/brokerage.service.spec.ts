import { Test, TestingModule } from '@nestjs/testing';
import { BrokerageService } from './brokerage.service';

describe('BrokerageService', () => {
  let service: BrokerageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrokerageService],
    }).compile();

    service = module.get<BrokerageService>(BrokerageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
