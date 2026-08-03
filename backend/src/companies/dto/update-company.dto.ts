import { ApiPropertyOptional } from '@nestjs/swagger';
import type { EngagementStatus } from '../company.model';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Acme Corp' })
  name?: string;

  @ApiPropertyOptional({ example: 'Technology' })
  industry?: string;

  @ApiPropertyOptional({ example: 'Jane Smith' })
  contactName?: string;

  @ApiPropertyOptional({ example: 'jane@acme.com' })
  contactEmail?: string;

  @ApiPropertyOptional({ example: 12 })
  participantCount?: number;

  @ApiPropertyOptional({ example: 'active' })
  engagementStatus?: EngagementStatus;
}
