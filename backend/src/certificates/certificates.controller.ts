import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CertificateStatus } from './certificate.model';

@ApiTags('Data')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all certificates' })
  getCertificates() {
    return this.certificatesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a certificate' })
  createCertificate(@Body() body: Partial<{
    sessionId: string;
    participantId: string;
    participantName: string;
    company: string;
    role: string;
    score: number;
    completionDate: string;
    status: CertificateStatus;
  }>) {
    return this.certificatesService.create({
      id: `cert_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      ...body,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update certificate status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: CertificateStatus },
  ) {
    return this.certificatesService.updateStatus(id, body.status);
  }
}
