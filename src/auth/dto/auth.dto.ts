import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123', description: 'The password of the user' })
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;
  
  @ApiProperty({ example: 'johndoe', description: 'The alias of the user', required: false })
  @IsOptional()
  @IsString()
  alias?: string;
}
