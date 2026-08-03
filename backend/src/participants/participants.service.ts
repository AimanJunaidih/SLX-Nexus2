import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './participant.model';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepo: Repository<Participant>,
  ) {}

  findAll(): Promise<Participant[]> {
    return this.participantRepo.find();
  }

  create(createParticipantDto: CreateParticipantDto): Promise<Participant> {
    const participant = this.participantRepo.create(createParticipantDto);
    return this.participantRepo.save(participant);
  }

  async update(id: string, dto: UpdateParticipantDto): Promise<Participant> {
    const participant = await this.participantRepo.preload({ id, ...dto });
    if (!participant) throw new NotFoundException(`Participant ${id} not found`);
    return this.participantRepo.save(participant);
  }

  async remove(id: string): Promise<void> {
    await this.participantRepo.delete(id);
  }
}
