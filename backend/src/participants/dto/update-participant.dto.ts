import { ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleStatus } from '../participant.model';

export class UpdateParticipantDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  company?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  role?: string;

  @ApiPropertyOptional({ example: '#4f46e5' })
  avatarColor?: string;

  @ApiPropertyOptional({ example: [2, 1, 0, 0, 0] })
  mods?: ModuleStatus[];

  @ApiPropertyOptional({ example: 85 })
  score?: number;
}
