import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces';
import { AdminGuard } from './admin.guard';

const mockContext = (user: any): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as any);

describe('AdminGuard', () => {
  it('allows admin', () => {
    const guard = new AdminGuard();
    expect(guard.canActivate(mockContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('blocks non-admin', () => {
    const guard = new AdminGuard();
    expect(() => guard.canActivate(mockContext({ role: 'USER' }))).toThrow(ForbiddenException);
  });
});
