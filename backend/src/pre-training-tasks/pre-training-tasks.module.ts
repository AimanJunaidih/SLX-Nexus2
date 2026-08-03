import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreTrainingTask } from './pre-training-task.model';
import { PreTrainingTasksService } from './pre-training-tasks.service';
import { PreTrainingTasksController } from './pre-training-tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PreTrainingTask])],
  controllers: [PreTrainingTasksController],
  providers: [PreTrainingTasksService],
  exports: [PreTrainingTasksService],
})
export class PreTrainingTasksModule {}
