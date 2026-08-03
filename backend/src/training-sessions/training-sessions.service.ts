import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession, SessionStatus } from './training-session.model';
import { SessionCompany } from './session-company.model';
import { SessionParticipant } from './session-participant.model';
import { CreateSessionDto } from './dto/create-session.dto';

function computeSessionStatus(date: string): SessionStatus {
  const today = new Date().toISOString().split('T')[0];
  if (date < today) return 'completed';
  if (date === today) return 'in-progress';
  return 'upcoming';
}

@Injectable()
export class TrainingSessionsService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionRepo: Repository<TrainingSession>,
    @InjectRepository(SessionCompany)
    private readonly sessionCompanyRepo: Repository<SessionCompany>,
    @InjectRepository(SessionParticipant)
    private readonly sessionParticipantRepo: Repository<SessionParticipant>,
  ) {}

  async findAll() {
    const sessions = await this.sessionRepo.find();
    const result: any[] = [];

    for (const session of sessions) {
      const sessionCompanies = await this.sessionCompanyRepo.find({ where: { sessionId: session.id } });
      const companies: any[] = [];

      for (const sc of sessionCompanies) {
        const participants = await this.sessionParticipantRepo.find({
          where: { sessionId: session.id, companyId: sc.companyId },
        });
        companies.push({
          id: sc.companyId,
          companyId: sc.companyId,
          participants: participants.map((sp) => ({ id: sp.participantId, participantId: sp.participantId })),
        });
      }

      result.push({ ...session, status: computeSessionStatus(session.date), companies });
    }

    return result;
  }

  async findOne(id: string) {
    const session = await this.sessionRepo.findOneBy({ id });
    if (!session) throw new NotFoundException(`Session ${id} not found`);

    const sessionCompanies = await this.sessionCompanyRepo.find({ where: { sessionId: id } });
    const companies: any[] = [];

    for (const sc of sessionCompanies) {
      const participants = await this.sessionParticipantRepo.find({
        where: { sessionId: id, companyId: sc.companyId },
      });
      companies.push({
        id: sc.companyId,
        companyId: sc.companyId,
        participants: participants.map((sp) => ({ id: sp.participantId, participantId: sp.participantId })),
      });
    }

    return { ...session, status: computeSessionStatus(session.date), companies };
  }

  create(dto: CreateSessionDto): Promise<TrainingSession> {
    const id = `ts_${Date.now()}`;
    const session = this.sessionRepo.create({ ...dto, id });
    return this.sessionRepo.save(session);
  }

  async remove(id: string): Promise<void> {
    await this.sessionParticipantRepo.delete({ sessionId: id });
    await this.sessionCompanyRepo.delete({ sessionId: id });
    const result = await this.sessionRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Session ${id} not found`);
  }

  async addCompany(sessionId: string, companyId: string) {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    const existing = await this.sessionCompanyRepo.findOneBy({ sessionId, companyId });
    if (existing) return existing;

    const id = `sc_${sessionId}_${companyId}`;
    const sc = this.sessionCompanyRepo.create({ id, sessionId, companyId });
    return this.sessionCompanyRepo.save(sc);
  }

  async removeCompany(sessionId: string, companyId: string) {
    await this.sessionParticipantRepo.delete({ sessionId, companyId });
    await this.sessionCompanyRepo.delete({ sessionId, companyId });
  }

  async addParticipant(sessionId: string, companyId: string, participantId: string) {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    const existing = await this.sessionParticipantRepo.findOneBy({ sessionId, companyId, participantId });
    if (existing) return existing;

    const id = `sp_${sessionId}_${companyId}_${participantId}`;
    const sp = this.sessionParticipantRepo.create({ id, sessionId, companyId, participantId });
    return this.sessionParticipantRepo.save(sp);
  }

  async removeParticipant(sessionId: string, companyId: string, participantId: string) {
    await this.sessionParticipantRepo.delete({ sessionId, companyId, participantId });
  }
}
