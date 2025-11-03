import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'navidreza' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'navidreza@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'abfkjsldfhh8712' })
  @IsString()
  fingerprint: string;
}
