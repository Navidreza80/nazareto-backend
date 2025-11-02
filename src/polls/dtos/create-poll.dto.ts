import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, MinLength } from 'class-validator';

export class CreatePollDto {
  @ApiProperty({ example: 'What is your favorite frontend framework?' })
  @IsString()
  @MinLength(5)
  question: string;

  @ApiProperty({ example: ['React', 'Vue', 'Angluar', 'SvelteKit'] })
  @IsArray()
  @IsString({ each: true })
  options: string[];
}
