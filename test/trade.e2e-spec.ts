import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { BrokerageService } from './../src/brokerage/brokerage.service';

describe('TradeController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let brokerageService: BrokerageService;
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
    
    // Clean up DB
    await prisma.trade.deleteMany();
    await prisma.brokerAccount.deleteMany();
    await prisma.user.deleteMany();

    // Create User
    const user = await authService.register({
      email: 'trade-test@example.com',
      passwordHash: 'password123',
      firstName: 'Trade',
      lastName: 'Tester',
      alias: 'tradetest',
    });
    
    const login = await authService.login(user);
    jwtToken = login.access_token;
    userId = user.id;

    // Connect Broker Account (Fake)
    await brokerageService.connectAccount(userId, 'fake');
  });

  afterAll(async () => {
    await prisma.trade.deleteMany();
    await prisma.brokerAccount.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/trades/sync (POST)', () => {
    return request(app.getHttpServer())
      .post('/trades/sync')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(201)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].symbol).toBeDefined();
      });
  });

  it('/trades (GET)', () => {
    return request(app.getHttpServer())
      .get('/trades')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });
});
