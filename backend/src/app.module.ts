import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeederService } from './seeder.service';

import { ParticipantsModule } from './participants/participants.module';
import { CompaniesModule } from './companies/companies.module';
import { MaterialsModule } from './materials/materials.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TrainingSessionsModule } from './training-sessions/training-sessions.module';
import { PostTrainingTasksModule } from './post-training-tasks/post-training-tasks.module';
import { PostTrainingTask } from './post-training-tasks/post-training-task.model';
import { PreTrainingTasksModule } from './pre-training-tasks/pre-training-tasks.module';
import { PreTrainingTask } from './pre-training-tasks/pre-training-task.model';
import { AttendanceModule } from './attendance/attendance.module';
import { Attendance } from './attendance/attendance.model';
import { Company } from './companies/company.model';
import { Participant } from './participants/participant.model';
import { Material } from './materials/material.model';
import { Certificate } from './certificates/certificate.model';
import { ScheduleDay } from './schedule/schedule.model';
import { TrainingSession } from './training-sessions/training-session.model';
import { SessionCompany } from './training-sessions/session-company.model';
import { SessionParticipant } from './training-sessions/session-participant.model';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '',
      database: 'slx_nexus2',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Company, Participant, Material, Certificate, ScheduleDay, TrainingSession, SessionCompany, SessionParticipant, PostTrainingTask, PreTrainingTask, Attendance]),
    ParticipantsModule,
    CompaniesModule,
    MaterialsModule,
    CertificatesModule,
    ScheduleModule,
    TrainingSessionsModule,
    PostTrainingTasksModule,
    PreTrainingTasksModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
