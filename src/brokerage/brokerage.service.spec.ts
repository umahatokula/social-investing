import { Test, TestingModule } from '@nestjs/testing';
import { BrokerageService } from './brokerage.service';
import { BrokerageProviderRegistry } from './registry/brokerage-provider.registry';
import { PrismaService } from '../prisma/prisma.service';

describe('BrokerageService', () => {
  let service: BrokerageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrokerageService,
        BrokerageProviderRegistry,
        {
          provide: PrismaService,
          useValue: {
            brokerAccount: {
              upsert: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            trade: { upsert: jest.fn() },
            holding: { upsert: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<BrokerageService>(BrokerageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
