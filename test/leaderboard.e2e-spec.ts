import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { BrokerageService } from './../src/brokerage/brokerage.service';
import { TradeService } from './../src/trade/trade.service';
import { PortfolioService } from './../src/portfolio/portfolio.service';
import { PerformanceService } from './../src/performance/performance.service';
import { resetDb } from './utils/reset-db';

describe('LeaderboardController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let brokerageService: BrokerageService;
  let tradeService: TradeService;
  let portfolioService: PortfolioService;
  let performanceService: PerformanceService;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    authService = app.get(AuthService);
    brokerageService = app.get(BrokerageService);
    tradeService = app.get(TradeService);
    portfolioService = app.get(PortfolioService);
    performanceService = app.get(PerformanceService);
    
    await resetDb(prisma);

    // Create User
    const user = await authService.register({
      email: 'leader-test@example.com',
      passwordHash: 'password123',
      firstName: 'Leader',
      lastName: 'Tester',
      alias: 'leadertest',
    });
    
    const login = await authService.login(user);
    jwtToken = login.access_token;
    userId = user.id;

    // Setup Data & Metrics
    await brokerageService.connectAccount(userId, 'finnhub-demo');
    await tradeService.syncTradesForUser(userId);
    await portfolioService.calculateHoldings(userId);
    await performanceService.calculateMetrics(userId);
  });

  afterAll(async () => {
    await resetDb(prisma);
    await app.close();
  });

  it('/leaderboard (GET)', () => {
    return request(app.getHttpServer())
      .get('/leaderboard')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].alias).toEqual('leadertest');
        expect(res.body[0].totalReturn).toBeDefined();
      });
  });
});
