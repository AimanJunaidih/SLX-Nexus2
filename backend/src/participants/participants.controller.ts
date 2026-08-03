import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@ApiTags('Data')
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all participants' })
  getParticipants() {
    return this.participantsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new participant' })
  createParticipant(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantsService.create(createParticipantDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a participant' })
  updateParticipant(@Param('id') id: string, @Body() dto: UpdateParticipantDto) {
    return this.participantsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a participant by ID' })
  deleteParticipant(@Param('id') id: string) {
    return this.participantsService.remove(id);
  }
}
