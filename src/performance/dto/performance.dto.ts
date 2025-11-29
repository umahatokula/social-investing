import { ApiProperty } from '@nestjs/swagger';

export class PerformanceMetricDto {
  @ApiProperty({ example: 'cuid123', description: 'Unique identifier' })
  id: string;

  @ApiProperty({ example: 'user123', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: '2025-11-28T12:00:00Z', description: 'Date of the metric snapshot' })
  date: Date;

  @ApiProperty({ example: 0.15, description: 'Total return (decimal)' })
  totalReturn: number;

  @ApiProperty({ example: 0.10, description: 'Year-to-date return (decimal)' })
  ytdReturn: number;

  @ApiProperty({ example: 0.01, description: 'Daily return (decimal)' })
  dailyReturn: number;

  @ApiProperty({ example: 0.6, description: 'Win rate (decimal)' })
  winRate: number;

  @ApiProperty({ example: 500, description: 'Average win amount' })
  avgWin: number;

  @ApiProperty({ example: 200, description: 'Average loss amount' })
  avgLoss: number;

  @ApiProperty({ example: 1.5, description: 'Profit factor' })
  profitFactor: number;

  @ApiProperty({ example: -0.05, description: 'Maximum drawdown (decimal)' })
  maxDrawdown: number;

  @ApiProperty({ example: 3, description: 'Risk score (1-5)' })
  riskScore: number;

  @ApiProperty({ example: '2025-11-28T12:00:00Z', description: 'Creation timestamp' })
  createdAt: Date;
}
