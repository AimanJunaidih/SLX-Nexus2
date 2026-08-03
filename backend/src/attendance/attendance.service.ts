import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.model';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  async findBySession(sessionId: string): Promise<Attendance[]> {
    return this.attendanceRepo.find({ where: { sessionId } });
  }

  async sync(sessionId: string, items: { participantId: string; companyId: string; day1: boolean; day2: boolean }[]): Promise<Attendance[]> {
    await this.attendanceRepo.delete({ sessionId });

    const records = items.map((item) =>
      this.attendanceRepo.create({
        id: `att_${sessionId}_${item.participantId}`,
        sessionId,
        participantId: item.participantId,
        companyId: item.companyId,
        day1: item.day1,
        day2: item.day2,
      }),
    );

    return this.attendanceRepo.save(records);
  }
}
