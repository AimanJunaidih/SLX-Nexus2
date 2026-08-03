import { ApiProperty } from '@nestjs/swagger';
import type { MaterialType, MaterialStatus } from '../material.model';

export class CreateMaterialDto {
  @ApiProperty({ example: 'Onboarding Guide v2.1' })
  title: string;

  @ApiProperty({ example: 'document' })
  type: MaterialType;

  @ApiProperty({ example: 842 })
  sizeKb: number;

  @ApiProperty({ example: 'ready' })
  status: MaterialStatus;

  @ApiProperty({ example: '2026-05-10' })
  uploadedAt: string;

  @ApiProperty({ example: 'Admin' })
  owner: string;
}
