import { Get, Param, Delete, Post, Body } from '@nestjs/common';
import { AbstractService } from './abstract.service';
import { AbstractObject } from '../types/data.interface';

export class AbstractController<
  MainType extends AbstractObject,
  RelatedType extends AbstractObject,
> {
  constructor(
    private readonly service: AbstractService<MainType, RelatedType>,
  ) {}

  @Get()
  async findAll(): Promise<MainType[]> {
    return this.service.findAllComplete();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MainType> {
    return this.service.findOneComplete(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{message: string}> {
    return this.service.remove(id);
  }
}
