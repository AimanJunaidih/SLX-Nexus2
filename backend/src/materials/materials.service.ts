import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.model';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  findAll(): Promise<Material[]> {
    return this.materialRepo.find();
  }

  create(data: Partial<Material>): Promise<Material> {
    const material = this.materialRepo.create(data);
    return this.materialRepo.save(material);
  }

  async remove(id: string): Promise<void> {
    const result = await this.materialRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Material ${id} not found`);
    }
  }
}
