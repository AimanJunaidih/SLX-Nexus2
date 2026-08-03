import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSession } from './training-session.model';
import { SessionCompany } from './session-company.model';
import { SessionParticipant } from './session-participant.model';
import { TrainingSessionsService } from './training-sessions.service';
import { TrainingSessionsController } from './training-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingSession, SessionCompany, SessionParticipant])],
  controllers: [TrainingSessionsController],
  providers: [TrainingSessionsService],
  exports: [TrainingSessionsService],
})
export class TrainingSessionsModule {}
