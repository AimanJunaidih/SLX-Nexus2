import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';

@ApiTags('Data')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get the schedule' })
  getSchedule() {
    return this.scheduleService.findAll();
  }
}
