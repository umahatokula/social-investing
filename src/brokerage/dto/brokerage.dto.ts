import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectBrokerageDto {
  @ApiProperty({ example: 'alpaca', description: 'The name of the brokerage' })
  @IsString()
  @IsNotEmpty()
  brokerName: string;

  @ApiProperty({ example: { apiKey: 'abc', secret: '123' }, description: 'Brokerage credentials', required: false })
  @IsOptional()
  credentials?: any;
}
