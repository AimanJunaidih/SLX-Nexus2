import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'c1', description: 'The unique ID of the company' })
  id: string;

  @ApiProperty({ example: 'Acme Corp', description: 'The name of the company' })
  name: string;
}
