import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { BrokerageService } from './../src/brokerage/brokerage.service';
import { TradeService } from './../src/trade/trade.service';

describe('PortfolioController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let brokerageService: BrokerageService;
  let tradeService: TradeService;
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
    
    // Clean up DB
    await prisma.holding.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.brokerAccount.deleteMany();
    await prisma.user.deleteMany();

    // Create User
    const user = await authService.register({
      email: 'portfolio-test@example.com',
      passwordHash: 'password123',
      firstName: 'Portfolio',
      lastName: 'Tester',
      alias: 'portfoliotest',
    });
    
    const login = await authService.login(user);
    jwtToken = login.access_token;
    userId = user.id;

    // Connect Broker Account (Fake)
    await brokerageService.connectAccount(userId, 'fake');
    
    // Sync Trades (Fake provider returns 1 BUY AAPL, 1 SELL TSLA)
    await tradeService.syncTradesForUser(userId);
  });

  afterAll(async () => {
    await prisma.holding.deleteMany();
    await prisma.trade.deleteMany();
    await prisma.brokerAccount.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/portfolio/sync (POST)', () => {
    return request(app.getHttpServer())
      .post('/portfolio/sync')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(201)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        // Fake provider: 10 AAPL BUY. 5 TSLA SELL (Short? or just sell).
        // If SELL without BUY, quantity becomes negative.
        // AAPL: 10 qty, 150 price.
        // TSLA: -5 qty, 200 price.
        // Our service filters out qty <= 0? No, it filters out qty === 0?
        // Code: if (position.quantity > 0) upsert else delete.
        // So TSLA should be deleted/not created if negative.
        // AAPL should be there.
        const aapl = res.body.find((h) => h.symbol === 'AAPL');
        expect(aapl).toBeDefined();
        expect(Number(aapl.quantity)).toBe(10);
      });
  });

  it('/portfolio/holdings (GET)', () => {
    return request(app.getHttpServer())
      .get('/portfolio/holdings')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/portfolio/summary (GET)', () => {
    return request(app.getHttpServer())
      .get('/portfolio/summary')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.totalValue).toBeDefined();
        expect(res.body.holdingsCount).toBeGreaterThan(0);
      });
  });
});
