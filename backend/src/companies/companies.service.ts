import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.model';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companyRepo.find();
  }

  create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companyRepo.create(companyData);
    return this.companyRepo.save(company);
  }

  async remove(id: string): Promise<void> {
    await this.companyRepo.delete(id);
  }
}
