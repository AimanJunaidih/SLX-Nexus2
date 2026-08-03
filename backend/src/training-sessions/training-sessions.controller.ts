import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TrainingSessionsService } from './training-sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AddCompanyDto, AddParticipantDto } from './dto/assignment.dto';

@ApiTags('Data')
@Controller('training-sessions')
export class TrainingSessionsController {
  constructor(private readonly sessionsService: TrainingSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all training sessions' })
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a training session by id' })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a training session' })
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training session' })
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }

  @Post(':sessionId/companies')
  @ApiOperation({ summary: 'Add a company to a session' })
  addCompany(@Param('sessionId') sessionId: string, @Body() dto: AddCompanyDto) {
    return this.sessionsService.addCompany(sessionId, dto.companyId);
  }

  @Delete(':sessionId/companies/:companyId')
  @ApiOperation({ summary: 'Remove a company from a session' })
  removeCompany(@Param('sessionId') sessionId: string, @Param('companyId') companyId: string) {
    return this.sessionsService.removeCompany(sessionId, companyId);
  }

  @Post(':sessionId/companies/:companyId/participants')
  @ApiOperation({ summary: 'Add a participant to a company in a session' })
  addParticipant(
    @Param('sessionId') sessionId: string,
    @Param('companyId') companyId: string,
    @Body() dto: AddParticipantDto,
  ) {
    return this.sessionsService.addParticipant(sessionId, companyId, dto.participantId);
  }

  @Delete(':sessionId/companies/:companyId/participants/:participantId')
  @ApiOperation({ summary: 'Remove a participant from a company in a session' })
  removeParticipant(
    @Param('sessionId') sessionId: string,
    @Param('companyId') companyId: string,
    @Param('participantId') participantId: string,
  ) {
    return this.sessionsService.removeParticipant(sessionId, companyId, participantId);
  }
}
