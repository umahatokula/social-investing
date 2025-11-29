import { Test, TestingModule } from '@nestjs/testing';
import { TradeService } from './trade.service';
import { PrismaService } from '../prisma/prisma.service';
import { BrokerageService } from '../brokerage/brokerage.service';
import { ActivityService } from '../activity/activity.service';

describe('TradeService', () => {
  let service: TradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeService,
        { provide: PrismaService, useValue: { trade: { findMany: jest.fn() }, brokerAccount: { findMany: jest.fn() } } },
        { provide: BrokerageService, useValue: { getAccounts: jest.fn(), syncAccount: jest.fn().mockResolvedValue({ trades: 0, holdings: 0 }) } },
        { provide: ActivityService, useValue: { logActivity: jest.fn() } },
      ],
    }).compile();

    service = module.get<TradeService>(TradeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
