import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { TradeService } from '../trade/trade.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { PerformanceService } from '../performance/performance.service';

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: PrismaService, useValue: {} },
        { provide: TradeService, useValue: {} },
        { provide: PortfolioService, useValue: {} },
        { provide: PerformanceService, useValue: {} },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have handleCron method', () => {
    expect(service.handleCron).toBeDefined();
  });
});
