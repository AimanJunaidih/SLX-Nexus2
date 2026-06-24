import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './participant.model';
import { CreateParticipantDto } from './dto/create-participant.dto';

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
}
