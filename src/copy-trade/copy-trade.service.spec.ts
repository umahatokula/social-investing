import { Test, TestingModule } from '@nestjs/testing';
import { CopyTradeService } from './copy-trade.service';
import { PrismaService } from '../prisma/prisma.service';
import { FollowService } from '../follow/follow.service';
import { ActivityService } from '../activity/activity.service';

describe('CopyTradeService', () => {
  let service: CopyTradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CopyTradeService,
        { provide: PrismaService, useValue: { trade: { findUnique: jest.fn(), create: jest.fn() }, follow: { findUnique: jest.fn() }, brokerAccount: { findFirst: jest.fn(), create: jest.fn() }, copyTradeSession: { upsert: jest.fn() }, copyTradeExecution: { create: jest.fn() } } },
        { provide: FollowService, useValue: {} },
        { provide: ActivityService, useValue: { logActivity: jest.fn() } },
      ],
    }).compile();

    service = module.get<CopyTradeService>(CopyTradeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
