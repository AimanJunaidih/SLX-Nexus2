import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Data')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  getCompanies() {
    return this.companiesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company' })
  updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company by ID' })
  deleteCompany(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get participants for a company' })
  getCompanyParticipants(@Param('id') id: string) {
    return this.companiesService.findParticipants(id);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add a participant to a company' })
  addParticipantToCompany(
    @Param('id') id: string,
    @Body('participantId') participantId: string,
  ) {
    return this.companiesService.addParticipant(id, participantId);
  }

  @Delete(':id/participants/:participantId')
  @ApiOperation({ summary: 'Remove a participant from a company' })
  removeParticipantFromCompany(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ) {
    return this.companiesService.removeParticipant(id, participantId);
  }
}
