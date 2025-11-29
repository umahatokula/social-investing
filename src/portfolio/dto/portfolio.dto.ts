import { ApiProperty } from '@nestjs/swagger';

export class HoldingDto {
  @ApiProperty({ example: 'cuid123', description: 'Unique identifier' })
  id: string;

  @ApiProperty({ example: 'user123', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'acc123', description: 'Broker Account ID' })
  brokerAccountId: string;

  @ApiProperty({ example: 'AAPL', description: 'Asset symbol' })
  symbol: string;

  @ApiProperty({ example: 10, description: 'Quantity held' })
  quantity: number;

  @ApiProperty({ example: 150.50, description: 'Average purchase price' })
  averagePrice: number;

  @ApiProperty({ example: 1505.00, description: 'Current market value' })
  marketValue: number;

  @ApiProperty({ example: '2025-11-28T12:00:00Z', description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PortfolioSummaryDto {
  @ApiProperty({ example: 15000.50, description: 'Total value of all holdings' })
  totalValue: number;

  @ApiProperty({ example: 5, description: 'Number of unique holdings' })
  holdingsCount: number;
}
