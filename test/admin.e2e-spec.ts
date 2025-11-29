import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { Role, UserStatus } from '@prisma/client';
import { resetDb } from './utils/reset-db';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let adminToken: string;
  let userToBanId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    authService = app.get(AuthService);
    
    await resetDb(prisma);

    // Create Admin User
    const admin = await authService.register({
      email: 'admin@example.com',
      passwordHash: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      alias: 'admin',
    });
    // Manually set role to ADMIN
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: Role.ADMIN },
    });
    const adminUser = await prisma.user.findUnique({ where: { id: admin.id } });
    const adminLogin = await authService.login(adminUser!);
    adminToken = adminLogin.access_token;

    // Create User to Ban
    const user = await authService.register({
      email: 'bannable@example.com',
      passwordHash: 'password123',
      firstName: 'Bannable',
      lastName: 'User',
      alias: 'bannable',
    });
    userToBanId = user.id;
  });

  afterAll(async () => {
    await resetDb(prisma);
    await app.close();
  });

  it('/admin/ban/:userId (POST)', () => {
    return request(app.getHttpServer())
      .post(`/admin/ban/${userToBanId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe(UserStatus.BANNED);
      });
  });

  it('/admin/unban/:userId (POST)', () => {
    return request(app.getHttpServer())
      .post(`/admin/unban/${userToBanId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe(UserStatus.ACTIVE);
      });
  });

  it('/admin/logs (GET)', () => {
    return request(app.getHttpServer())
      .get('/admin/logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
