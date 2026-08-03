import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostTrainingTask } from './post-training-task.model';

const DEFAULT_TEMPLATE_TASKS = [
  'Update JD14 file',
  'Submit HRD',
  'Distribute certificates',
  'Send training summary report',
  'Archive training materials',
];

@Injectable()
export class PostTrainingTasksService {
  constructor(
    @InjectRepository(PostTrainingTask)
    private readonly taskRepo: Repository<PostTrainingTask>,
  ) {}

  async findBySessionAndCompany(sessionId: string, companyId: string): Promise<PostTrainingTask[]> {
    const tasks = await this.taskRepo.find({
      where: { sessionId, companyId },
      order: { sortOrder: 'ASC' },
    });

    if (tasks.length === 0) {
      return this.seedDefaults(sessionId, companyId);
    }

    return tasks;
  }

  private async seedDefaults(sessionId: string, companyId: string): Promise<PostTrainingTask[]> {
    const tasks = DEFAULT_TEMPLATE_TASKS.map((text, idx) =>
      this.taskRepo.create({
        id: `ptt_${sessionId}_${companyId}_${idx + 1}`,
        sessionId,
        companyId,
        text,
        done: false,
        sortOrder: idx,
      }),
    );
    return this.taskRepo.save(tasks);
  }

  async sync(sessionId: string, companyId: string, items: { id: string; text: string; done: boolean; sortOrder: number }[]): Promise<PostTrainingTask[]> {
    await this.taskRepo.delete({ sessionId, companyId });

    const tasks = items.map((item) =>
      this.taskRepo.create({
        id: item.id || `ptt_${sessionId}_${companyId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sessionId,
        companyId,
        text: item.text,
        done: item.done,
        sortOrder: item.sortOrder,
      }),
    );

    return this.taskRepo.save(tasks);
  }
}
