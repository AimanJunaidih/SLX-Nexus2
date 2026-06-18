import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataController } from './data.controller';
import { SeederService } from './seeder.service';
import { Company } from './entities/company';
import { Participant } from './entities/participant';
import { Material } from './entities/material';
import { Certificate } from './entities/certificate';
import { ScheduleDay } from './entities/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '',
      database: 'slx_nexus2',
      entities: [Company, Participant, Material, Certificate, ScheduleDay],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Company, Participant, Material, Certificate, ScheduleDay]),
  ],
  controllers: [AppController, DataController],
  providers: [AppService, SeederService],
})
export class AppModule {}
