import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company by ID' })
  deleteCompany(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
