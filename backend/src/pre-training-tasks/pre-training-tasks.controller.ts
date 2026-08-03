import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PreTrainingTasksService } from './pre-training-tasks.service';

@ApiTags('Data')
@Controller('pre-training-tasks')
export class PreTrainingTasksController {
  constructor(private readonly tasksService: PreTrainingTasksService) {}

  @Get(':sessionId/:companyId')
  @ApiOperation({ summary: 'Get tasks for a session+company (auto-seeds defaults if empty)' })
  getTasks(@Param('sessionId') sessionId: string, @Param('companyId') companyId: string) {
    return this.tasksService.findBySessionAndCompany(sessionId, companyId);
  }

  @Post(':sessionId/:companyId/sync')
  @ApiOperation({ summary: 'Replace all tasks for a session+company' })
  syncTasks(
    @Param('sessionId') sessionId: string,
    @Param('companyId') companyId: string,
    @Body() body: { items: { id: string; text: string; done: boolean; sortOrder: number }[] },
  ) {
    return this.tasksService.sync(sessionId, companyId, body.items || []);
  }
}
