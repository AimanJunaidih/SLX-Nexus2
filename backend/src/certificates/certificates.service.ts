import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate, CertificateStatus } from './certificate.model';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,
  ) {}

  findAll(): Promise<Certificate[]> {
    return this.certificateRepo.find();
  }

  create(data: Partial<Certificate>): Promise<Certificate> {
    const cert = this.certificateRepo.create(data);
    return this.certificateRepo.save(cert);
  }

  async updateStatus(id: string, status: CertificateStatus): Promise<Certificate> {
    const cert = await this.certificateRepo.findOneBy({ id });
    if (!cert) throw new NotFoundException(`Certificate ${id} not found`);
    cert.status = status;
    if (status === 'issued' && !cert.completionDate) {
      cert.completionDate = new Date().toISOString().slice(0, 10);
    }
    return this.certificateRepo.save(cert);
  }
}
