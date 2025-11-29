import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../prisma/prisma.service';
import { PriceService } from './price.service';

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: PrismaService, useValue: { trade: { findMany: jest.fn() }, holding: { upsert: jest.fn(), deleteMany: jest.fn(), findMany: jest.fn() } } },
        { provide: PriceService, useValue: { getPrice: jest.fn().mockResolvedValue(100) } },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
