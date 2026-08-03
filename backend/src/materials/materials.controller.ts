import { Controller, Get, Post, Delete, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

@ApiTags('Data')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all materials' })
  getMaterials() {
    return this.materialsService.findAll();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
          }
          cb(null, UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          cb(null, `${name}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Create a material with file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        type: { type: 'string' },
        status: { type: 'string' },
        owner: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  createMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('type') type: string,
    @Body('status') status: string,
    @Body('owner') owner: string,
  ) {
    const sizeKb = file ? Math.round(file.size / 1024) : 0;
    const filePath = file ? `/uploads/${file.filename}` : undefined;

    return this.materialsService.create({
      id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      title: title || file?.originalname || 'Untitled',
      type: (type as any) || 'document',
      sizeKb,
      status: (status as any) || 'draft',
      uploadedAt: new Date().toISOString().slice(0, 10),
      owner: owner || 'Admin',
      filePath,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a material' })
  deleteMaterial(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Delete multiple materials' })
  async bulkDelete(@Body() body: { ids: string[] }) {
    for (const id of body.ids) {
      await this.materialsService.remove(id);
    }
    return { deleted: body.ids.length };
  }
}
