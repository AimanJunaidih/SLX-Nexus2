import { ApiProperty } from '@nestjs/swagger';
import { ModuleStatus } from '../participant.model';

export class CreateParticipantDto {
  @ApiProperty({ example: 'p50', description: 'The unique ID of the participant' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'The full name of the participant' })
  name: string;

  @ApiProperty({ example: 'Acme Corp', description: 'The company the participant belongs to' })
  company: string;

  @ApiProperty({ example: 'Software Engineer', description: 'The role of the participant' })
  role: string;

  @ApiProperty({ example: '#4f46e5', description: 'Hex color for the participant avatar' })
  avatarColor: string;

  @ApiProperty({
    example: [2, 1, 0, 0, 0],
    description: 'Array representing the status of each module (0=pending, 1=in-progress, 2=complete)',
  })
  mods: ModuleStatus[];

  @ApiProperty({ example: 85, description: 'The participant score' })
  score: number;
}
