import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne({ email });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      if (user.status === 'BANNED') {
        throw new UnauthorizedException('User is banned');
      }
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: Prisma.UserCreateInput) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(data.passwordHash, salt);
    try {
      const user = await this.userService.createUser({
        ...data,
        passwordHash,
      });
      const { passwordHash: _, ...result } = user;
      return result;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = Array.isArray(err.meta?.target) ? err.meta.target : [];
        if (target.includes('alias')) {
          throw new BadRequestException('Alias already in use');
        }
        throw new BadRequestException('Email already in use');
      }
      throw err;
    }
  }
}
