import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './companies/company.model';
import { Participant } from './participants/participant.model';
import { Material } from './materials/material.model';
import { Certificate } from './certificates/certificate.model';
import { ScheduleDay } from './schedule/schedule.model';
import { TrainingSession } from './training-sessions/training-session.model';
import { SessionCompany } from './training-sessions/session-company.model';
import { SessionParticipant } from './training-sessions/session-participant.model';

import { companies } from './data-access/companies';
import { participants } from './data-access/participants';
import { materials } from './data-access/materials';
import { certificates } from './data-access/certificates';
import { scheduleData } from './data-access/scheduleData';
import { trainingSessions, sessionCompanies, sessionParticipants } from './data-access/trainingSessions';

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
    @InjectRepository(TrainingSession)
    private readonly trainingSessionRepo: Repository<TrainingSession>,
    @InjectRepository(SessionCompany)
    private readonly sessionCompanyRepo: Repository<SessionCompany>,
    @InjectRepository(SessionParticipant)
    private readonly sessionParticipantRepo: Repository<SessionParticipant>,
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

    const sessionCount = await this.trainingSessionRepo.count();
    if (sessionCount === 0) {
      this.logger.log('Seeding Training Sessions...');
      await this.trainingSessionRepo.save(trainingSessions);
      await this.sessionCompanyRepo.save(sessionCompanies);
      await this.sessionParticipantRepo.save(sessionParticipants);
    }

    this.logger.log('Database Seeding Complete!');
  }
}
