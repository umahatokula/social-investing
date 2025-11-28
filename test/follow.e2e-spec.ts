import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthService } from './../src/auth/auth.service';

describe('FollowController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let followerToken: string;
  let followingToken: string;
  let followerId: string;
  let followingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    authService = app.get(AuthService);
    
    // Clean up DB
    await prisma.follow.deleteMany();
    await prisma.user.deleteMany();

    // Create Follower User
    const follower = await authService.register({
      email: 'follower@example.com',
      passwordHash: 'password123',
      firstName: 'Follower',
      lastName: 'User',
      alias: 'follower',
    });
    const followerLogin = await authService.login(follower);
    followerToken = followerLogin.access_token;
    followerId = follower.id;

    // Create Following User
    const following = await authService.register({
      email: 'following@example.com',
      passwordHash: 'password123',
      firstName: 'Following',
      lastName: 'User',
      alias: 'following',
    });
    followingId = following.id;
  });

  afterAll(async () => {
    await prisma.follow.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/follow/:id (POST)', () => {
    return request(app.getHttpServer())
      .post(`/follow/${followingId}`)
      .set('Authorization', `Bearer ${followerToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.followerId).toBe(followerId);
        expect(res.body.followingId).toBe(followingId);
      });
  });

  it('/follow/following (GET)', () => {
    return request(app.getHttpServer())
      .get('/follow/following')
      .set('Authorization', `Bearer ${followerToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].following.id).toBe(followingId);
      });
  });

  it('/follow/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/follow/${followingId}`)
      .set('Authorization', `Bearer ${followerToken}`)
      .expect(200);
  });
});
