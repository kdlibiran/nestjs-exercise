import { Get, Param, Delete } from '@nestjs/common';
import { AbstractService } from './abstract.service';
import { IObj } from '../types/data.interface';

export class AbstractController<
  MainType extends IObj,
  RelatedType extends IObj,
  ReturnType extends IObj,
> {
  constructor(
    private readonly service: AbstractService<MainType, RelatedType, ReturnType>,
  ) {}

  @Get()
  async findAll(): Promise<ReturnType[]> {
    return this.service.findAllWithRelated();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReturnType> {
    return this.service.findOneWithRelated(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{message: string}> {
    return this.service.remove(id);
  }
}
