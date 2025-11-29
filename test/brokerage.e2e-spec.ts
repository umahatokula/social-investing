import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { resetDb } from './utils/reset-db';

describe('BrokerageController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    authService = app.get(AuthService);
    
    await resetDb(prisma);

    // Create User and get Token
    const user = await authService.register({
      email: 'brokerage-test@example.com',
      passwordHash: 'password123',
      firstName: 'Brokerage',
      lastName: 'Tester',
      alias: 'brokertest',
    });
    
    const login = await authService.login(user);
    jwtToken = login.access_token;
  });

  afterAll(async () => {
    await resetDb(prisma);
    await app.close();
  });

  it('/brokerage/connect (POST)', () => {
    return request(app.getHttpServer())
      .post('/brokerage/connect')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ brokerName: 'finnhub-demo' })
      .expect(201)
      .expect((res) => {
        expect(res.body.brokerName).toEqual('finnhub-demo');
        expect(res.body.userId).toBeDefined();
      });
  });

  it('/brokerage/accounts (GET)', () => {
    return request(app.getHttpServer())
      .get('/brokerage/accounts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].brokerName).toEqual('fake');
      });
  });
});
