import { ApiProperty } from '@nestjs/swagger';

export class TradeDto {
  @ApiProperty({ example: 'cuid123', description: 'Unique identifier' })
  id: string;

  @ApiProperty({ example: 'user123', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'acc123', description: 'Broker Account ID' })
  brokerAccountId: string;

  @ApiProperty({ example: 'AAPL', description: 'Asset symbol' })
  symbol: string;

  @ApiProperty({ example: 'EQUITY', description: 'Asset type' })
  assetType: string;

  @ApiProperty({ example: 'BUY', description: 'Trade side (BUY/SELL)' })
  side: string;

  @ApiProperty({ example: 10, description: 'Quantity traded' })
  quantity: number;

  @ApiProperty({ example: 150.50, description: 'Price per unit' })
  price: number;

  @ApiProperty({ example: '2025-11-28T12:00:00Z', description: 'Execution timestamp' })
  executedAt: Date;

  @ApiProperty({ example: 'ext123', description: 'External trade ID from broker', required: false })
  externalTradeId?: string;

  @ApiProperty({ example: '2025-11-28T12:00:00Z', description: 'Creation timestamp' })
  createdAt: Date;
}
