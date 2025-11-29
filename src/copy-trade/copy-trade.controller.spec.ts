import { Test, TestingModule } from '@nestjs/testing';
import { CopyTradeController } from './copy-trade.controller';
import { CopyTradeService } from './copy-trade.service';

describe('CopyTradeController', () => {
  let controller: CopyTradeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CopyTradeController],
      providers: [{ provide: CopyTradeService, useValue: { copyTrade: jest.fn() } }],
    }).compile();

    controller = module.get<CopyTradeController>(CopyTradeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
