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
  findAll(): MainType[] {
    return this.service.findAllComplete();
  }

  @Get(':id')
  findOne(@Param('id') id: string): MainType {
    return this.service.findOneComplete(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): {message: string} {
    return this.service.remove(id);
  }
}
