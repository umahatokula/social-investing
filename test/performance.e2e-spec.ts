import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { BrokerageService } from './../src/brokerage/brokerage.service';
import { TradeService } from './../src/trade/trade.service';
import { PortfolioService } from './../src/portfolio/portfolio.service';
import { resetDb } from './utils/reset-db';

describe('PerformanceController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let brokerageService: BrokerageService;
  let tradeService: TradeService;
  let portfolioService: PortfolioService;
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
    
    await resetDb(prisma);

    // Create User
    const user = await authService.register({
      email: 'perf-test@example.com',
      passwordHash: 'password123',
      firstName: 'Perf',
      lastName: 'Tester',
      alias: 'perftest',
    });
    
    const login = await authService.login(user);
    jwtToken = login.access_token;
    userId = user.id;

    // Setup Data
    await brokerageService.connectAccount(userId, 'fake');
    await tradeService.syncTradesForUser(userId);
    await portfolioService.calculateHoldings(userId);
  });

  afterAll(async () => {
    await resetDb(prisma);
    await app.close();
  });

  it('/performance/calculate (POST)', () => {
    return request(app.getHttpServer())
      .post('/performance/calculate')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.userId).toBe(userId);
        expect(res.body.totalReturn).toBeDefined();
        expect(res.body.riskScore).toBeDefined();
      });
  });

  it('/performance (GET)', () => {
    return request(app.getHttpServer())
      .get('/performance')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.userId).toBe(userId);
      });
  });
});
