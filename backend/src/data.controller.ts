import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Company } from './entities/company';
import { Participant } from './entities/participant';
import { Material } from './entities/material';
import { Certificate } from './entities/certificate';
import { ScheduleDay } from './entities/schedule';
import { CreateParticipantDto } from './dto/create-participant.dto';

@ApiTags('Data')
@Controller()
export class DataController {
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

  @Get('participants')
  @ApiOperation({ summary: 'Get all participants' })
  getParticipants() {
    return this.participantRepo.find();
  }

  @Post('participants')
  @ApiOperation({ summary: 'Create a new participant' })
  createParticipant(@Body() createParticipantDto: CreateParticipantDto) {
    const participant = this.participantRepo.create(createParticipantDto);
    return this.participantRepo.save(participant);
  }

  @Get('companies')
  @ApiOperation({ summary: 'Get all companies' })
  getCompanies() {
    return this.companyRepo.find();
  }

  @Get('materials')
  @ApiOperation({ summary: 'Get all materials' })
  getMaterials() {
    return this.materialRepo.find();
  }

  @Get('certificates')
  @ApiOperation({ summary: 'Get all certificates' })
  getCertificates() {
    return this.certificateRepo.find();
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Get the schedule' })
  getSchedule() {
    return this.scheduleRepo.find();
  }
}
