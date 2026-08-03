import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';

@ApiTags('Data')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get attendance for a session' })
  getAttendance(@Param('sessionId') sessionId: string) {
    return this.attendanceService.findBySession(sessionId);
  }

  @Post(':sessionId/sync')
  @ApiOperation({ summary: 'Replace all attendance for a session' })
  syncAttendance(
    @Param('sessionId') sessionId: string,
    @Body() body: { items: { participantId: string; companyId: string; day1: boolean; day2: boolean }[] },
  ) {
    return this.attendanceService.sync(sessionId, body.items || []);
  }
}
