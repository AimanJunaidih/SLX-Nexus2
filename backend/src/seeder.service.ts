import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './entities/company';
import { Participant } from './entities/participant';
import { Material } from './entities/material';
import { Certificate } from './entities/certificate';
import { ScheduleDay } from './entities/schedule';

import { companies } from './data-access/companies';
import { participants } from './data-access/participants';
import { materials } from './data-access/materials';
import { certificates } from './data-access/certificates';
import { scheduleData } from './data-access/scheduleData';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Participant)
    private readonly participantRepo: Repository<Participant>,
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,
    @InjectRepository(ScheduleDay)
    private readonly scheduleRepo: Repository<ScheduleDay>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking database for existing data...');

    const companyCount = await this.companyRepo.count();
    if (companyCount === 0) {
      this.logger.log('Seeding Companies...');
      await this.companyRepo.save(companies);
    }

    const participantCount = await this.participantRepo.count();
    if (participantCount === 0) {
      this.logger.log('Seeding Participants...');
      await this.participantRepo.save(participants);
    }

    const materialCount = await this.materialRepo.count();
    if (materialCount === 0) {
      this.logger.log('Seeding Materials...');
      await this.materialRepo.save(materials);
    }

    const certCount = await this.certificateRepo.count();
    if (certCount === 0) {
      this.logger.log('Seeding Certificates...');
      await this.certificateRepo.save(certificates);
    }

    const scheduleCount = await this.scheduleRepo.count();
    if (scheduleCount === 0) {
      this.logger.log('Seeding Schedule...');
      await this.scheduleRepo.save(scheduleData);
    }

    this.logger.log('Database Seeding Complete!');
  }
}
