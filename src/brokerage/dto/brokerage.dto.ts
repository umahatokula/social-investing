import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ConnectBrokerageDto {
  @IsString()
  @IsNotEmpty()
  brokerName: string;

  @IsOptional()
  credentials?: any;
}
