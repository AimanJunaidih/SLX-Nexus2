import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreTrainingTask } from './pre-training-task.model';

const DEFAULT_TEMPLATE_TASKS = [
  'Send welcome email to participants',
  'Share pre-reading materials',
  'Confirm attendance with company',
  'Verify LMS access for all participants',
  'Complete pre-assessment survey',
];

@Injectable()
export class PreTrainingTasksService {
  constructor(
    @InjectRepository(PreTrainingTask)
    private readonly taskRepo: Repository<PreTrainingTask>,
  ) {}

  async findBySessionAndCompany(sessionId: string, companyId: string): Promise<PreTrainingTask[]> {
    const tasks = await this.taskRepo.find({
      where: { sessionId, companyId },
      order: { sortOrder: 'ASC' },
    });

    if (tasks.length === 0) {
      return this.seedDefaults(sessionId, companyId);
    }

    return tasks;
  }

  private async seedDefaults(sessionId: string, companyId: string): Promise<PreTrainingTask[]> {
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

  async sync(sessionId: string, companyId: string, items: { id: string; text: string; done: boolean; sortOrder: number }[]): Promise<PreTrainingTask[]> {
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
