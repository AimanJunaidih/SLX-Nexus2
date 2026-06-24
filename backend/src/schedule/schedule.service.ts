import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleDay } from './schedule.model';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleDay)
    private readonly scheduleRepo: Repository<ScheduleDay>,
  ) {}

  findAll(): Promise<ScheduleDay[]> {
    return this.scheduleRepo.find();
  }
}
