import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { ActivityService } from './../src/activity/activity.service';

describe('ActivityController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let activityService: ActivityService;
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
    activityService = app.get(ActivityService);
    
    // Clean up DB
    await prisma.activity.deleteMany();
    await prisma.user.deleteMany();

    // Create User
    const user = await authService.register({
      email: 'activity-test@example.com',
      passwordHash: 'password123',
      firstName: 'Activity',
      lastName: 'Tester',
      alias: 'activitytest',
    });
    
    const login = await authService.login(user);
    jwtToken = login.access_token;
    userId = user.id;

    // Create Activity
    await activityService.logActivity(userId, 'TEST_ACTION', { foo: 'bar' });
  });

  afterAll(async () => {
    await prisma.activity.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/activity/feed (GET)', () => {
    return request(app.getHttpServer())
      .get('/activity/feed')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].type).toBe('TEST_ACTION');
      });
  });
});
