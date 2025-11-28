import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';

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
    
    // Clean up DB
    await prisma.brokerAccount.deleteMany();
    await prisma.user.deleteMany();

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
    await prisma.brokerAccount.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/brokerage/connect (POST)', () => {
    return request(app.getHttpServer())
      .post('/brokerage/connect')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ brokerName: 'fake' })
      .expect(201)
      .expect((res) => {
        expect(res.body.brokerName).toEqual('fake');
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
