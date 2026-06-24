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
import { Company } from './companies/company.model';
import { Participant } from './participants/participant.model';
import { Material } from './materials/material.model';
import { Certificate } from './certificates/certificate.model';
import { ScheduleDay } from './schedule/schedule.model';

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
    TypeOrmModule.forFeature([Company, Participant, Material, Certificate, ScheduleDay]),
    ParticipantsModule,
    CompaniesModule,
    MaterialsModule,
    CertificatesModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
