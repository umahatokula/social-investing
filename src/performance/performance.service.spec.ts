import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceService } from './performance.service';
import { PrismaService } from '../prisma/prisma.service';
import { PortfolioService } from '../portfolio/portfolio.service';

describe('PerformanceService', () => {
  let service: PerformanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceService,
        {
          provide: PrismaService,
          useValue: {
            equitySnapshot: { findMany: jest.fn(), upsert: jest.fn(), findFirst: jest.fn() },
            trade: { findMany: jest.fn() },
            performanceMetric: { create: jest.fn() },
            monthlyReturn: { upsert: jest.fn() },
          },
        },
        {
          provide: PortfolioService,
          useValue: {
            getPortfolioSummary: jest.fn().mockResolvedValue({ totalValue: 0, totalReturnPct: 0 }),
            createEquitySnapshot: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PerformanceService>(PerformanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
