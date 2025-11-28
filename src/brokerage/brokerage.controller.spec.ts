import { Test, TestingModule } from '@nestjs/testing';
import { BrokerageController } from './brokerage.controller';

describe('BrokerageController', () => {
  let controller: BrokerageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrokerageController],
    }).compile();

    controller = module.get<BrokerageController>(BrokerageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
