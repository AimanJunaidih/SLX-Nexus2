import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTrainingTask } from './post-training-task.model';
import { PostTrainingTasksService } from './post-training-tasks.service';
import { PostTrainingTasksController } from './post-training-tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostTrainingTask])],
  controllers: [PostTrainingTasksController],
  providers: [PostTrainingTasksService],
  exports: [PostTrainingTasksService],
})
export class PostTrainingTasksModule {}
