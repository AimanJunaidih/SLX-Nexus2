import { ApiProperty } from '@nestjs/swagger';
import type { SessionStatus } from '../training-session.model';

export class CreateSessionDto {
  @ApiProperty({ example: 'Session 4' })
  name: string;

  @ApiProperty({ example: '2026-08-05' })
  date: string;

  @ApiProperty({ example: 'upcoming' })
  status: SessionStatus;
}
