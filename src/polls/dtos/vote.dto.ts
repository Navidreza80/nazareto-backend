import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class VoteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pollId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  optionId: number;
}
