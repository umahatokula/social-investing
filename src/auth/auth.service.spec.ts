import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      findOne: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validates active user', async () => {
    const password = await bcrypt.hash('secret', 10);
    userService.findOne!.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: password,
      status: 'ACTIVE',
      role: 'USER',
    });

    const user = await service.validateUser('test@example.com', 'secret');
    expect(user.email).toBe('test@example.com');
  });

  it('rejects banned user', async () => {
    const password = await bcrypt.hash('secret', 10);
    userService.findOne!.mockResolvedValue({
      id: 'user-1',
      email: 'banned@example.com',
      passwordHash: password,
      status: 'BANNED',
      role: 'USER',
    });

    await expect(service.validateUser('banned@example.com', 'secret')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
