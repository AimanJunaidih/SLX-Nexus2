import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PostTrainingTasksService } from './post-training-tasks.service';

@ApiTags('Data')
@Controller('post-training-tasks')
export class PostTrainingTasksController {
  constructor(private readonly tasksService: PostTrainingTasksService) {}

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
