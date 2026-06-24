import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';

@ApiTags('Data')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all certificates' })
  getCertificates() {
    return this.certificatesService.findAll();
  }
}
