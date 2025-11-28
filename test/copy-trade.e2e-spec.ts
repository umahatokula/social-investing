import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { BrokerageService } from './../src/brokerage/brokerage.service';
import { TradeService } from './../src/trade/trade.service';
import { FollowService } from './../src/follow/follow.service';

describe('CopyTradeController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let brokerageService: BrokerageService;
  let tradeService: TradeService;
  let followService: FollowService;
  let copierToken: string;
  let traderToken: string;
  let copierId: string;
  let traderId: string;
  let tradeToCopyId: string;

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
    followService = app.get(FollowService);
    
    // Clean up DB
    await prisma.trade.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.brokerAccount.deleteMany();
    await prisma.user.deleteMany();

    // Create Copier User
    const copier = await authService.register({
      email: 'copier@example.com',
      passwordHash: 'password123',
      firstName: 'Copier',
      lastName: 'User',
      alias: 'copier',
    });
    const copierLogin = await authService.login(copier);
    copierToken = copierLogin.access_token;
    copierId = copier.id;

    // Create Trader User
    const trader = await authService.register({
      email: 'trader@example.com',
      passwordHash: 'password123',
      firstName: 'Trader',
      lastName: 'User',
      alias: 'trader',
    });
    traderId = trader.id;

    // Connect Trader Broker & Sync Trades
    await brokerageService.connectAccount(traderId, 'fake');
    const trades = await tradeService.syncTradesForUser(traderId);
    tradeToCopyId = trades[0].id;

    // Copier follows Trader
    await followService.followUser(copierId, traderId);
  });

  afterAll(async () => {
    await prisma.trade.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.brokerAccount.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/copy-trade/:tradeId (POST)', () => {
    return request(app.getHttpServer())
      .post(`/copy-trade/${tradeToCopyId}`)
      .set('Authorization', `Bearer ${copierToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.userId).toBe(copierId);
        expect(res.body.symbol).toBeDefined();
        // Should be a new trade ID
        expect(res.body.id).not.toBe(tradeToCopyId);
      });
  });
});
