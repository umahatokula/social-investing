import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  const createMock = jest.fn();
  const findManyMock = jest.fn();
  const notificationCreateMock = jest.fn();

  const prismaMock: any = {
    activity: { create: createMock, findMany: findManyMock },
    follow: { findMany: jest.fn().mockResolvedValue([{ followerId: 'f-1' }]) },
    notification: { create: notificationCreateMock },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs activity and notifies followers when requested', async () => {
    createMock.mockResolvedValue({ id: 'a1' });
    const service = new ActivityService(prismaMock);
    await service.logActivity('u1', 'TRADE_SYNCED', { symbol: 'AAPL' }, true);

    expect(createMock).toHaveBeenCalled();
    expect(notificationCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'f-1', type: 'TRADE_SYNCED' }),
    });
  });
});
