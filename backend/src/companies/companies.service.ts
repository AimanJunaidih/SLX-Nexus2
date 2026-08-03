import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.model';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ParticipantsService } from '../participants/participants.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly participantsService: ParticipantsService,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companyRepo.find();
  }

  create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companyRepo.create(companyData);
    return this.companyRepo.save(company);
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepo.preload({ id, ...dto });
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return this.companyRepo.save(company);
  }

  async remove(id: string): Promise<void> {
    await this.companyRepo.delete(id);
  }

  async findParticipants(companyId: string): Promise<any[]> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException(`Company ${companyId} not found`);
    const allParticipants = await this.participantsService.findAll();
    return allParticipants.filter((p) => p.company === company.name);
  }

  async addParticipant(companyId: string, participantId: string): Promise<any> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException(`Company ${companyId} not found`);
    await this.participantsService.update(participantId, { company: company.name });
    const participant = (await this.participantsService.findAll()).find((p) => p.id === participantId);
    await this.updateParticipantCount(companyId);
    return participant;
  }

  async removeParticipant(companyId: string, participantId: string): Promise<void> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException(`Company ${companyId} not found`);
    await this.participantsService.update(participantId, { company: '' });
    await this.updateParticipantCount(companyId);
  }

  async updateParticipantCount(companyId: string): Promise<void> {
    const participants = await this.findParticipants(companyId);
    await this.companyRepo.update(companyId, { participantCount: participants.length });
  }
}
