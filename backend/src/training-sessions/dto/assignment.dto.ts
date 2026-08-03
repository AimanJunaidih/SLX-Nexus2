import { ApiProperty } from '@nestjs/swagger';

export class AddCompanyDto {
  @ApiProperty({ example: 'c1' })
  companyId: string;
}

export class AddParticipantDto {
  @ApiProperty({ example: 'p1' })
  participantId: string;
}
