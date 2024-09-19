import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractDatabaseService } from '../data/abstract-database.service';
import { v4 as uuidv4 } from 'uuid';
import { AbstractObject } from '../types/data.interface';

@Injectable()
export class AbstractService<
  MainType extends AbstractObject,
  RelatedType extends AbstractObject,
> {

  constructor(
    private readonly mainDatabaseService: AbstractDatabaseService<MainType>,
    private readonly relatedDatabaseService: AbstractDatabaseService<RelatedType>,
    private readonly mainField: keyof RelatedType,
    private readonly relatedField: keyof MainType,
  ) {}

  getOne(id: string): MainType {
    const entity = this.mainDatabaseService.findOne(id);
    if (!entity) throw new NotFoundException(`Cannot find ${String(this.mainField)} with id ${id}`);
    return entity;
  }

  getAll(): MainType[] {
    return this.mainDatabaseService.findAll();
  }

  getOneWithRelated(id: string): MainType {
    const entity = this.getOne(id);
    const relatedEntities = this.relatedDatabaseService.findAllByRelatedFieldId(this.mainField, id);
    return { ...entity, [this.relatedField]: relatedEntities };
  }

  getAllWithRelated(): MainType[] {
    const entities = this.mainDatabaseService.findAll();
    return entities.map(entity => this.getOneWithRelated(entity.id));
  }

  create(createDto: Omit<MainType, "id">): MainType {
    this.validateRelatedEntities(createDto[this.relatedField as string]); // For validation
    const entity = this.mainDatabaseService.create({ id: uuidv4(), ...createDto } as MainType);
    this.relatedDatabaseService.addRelatedEntityToMany(entity.id, createDto[this.relatedField as string], this.mainField);
    return this.getOneWithRelated(entity.id);
  }

  update(id: string, updateDto: Partial<Omit<MainType, "id">>): MainType {
      const entity = this.getOne(id);
      this.validateRelatedEntities(updateDto[this.relatedField as string]); // For validation
      const updatedEntity = this.mainDatabaseService.update(id, { ...entity, ...updateDto });
      if (entity[this.relatedField] !== updatedEntity[this.relatedField]) {
        this.relatedDatabaseService.removeRelatedEntityFromMany(entity.id, entity[this.relatedField] as string[], this.mainField);
        this.relatedDatabaseService.addRelatedEntityToMany(entity.id, updatedEntity[this.relatedField] as string[], this.mainField);
      }
      return this.getOneWithRelated(updatedEntity.id);
  }

  remove(id: string): { message: string } {
      const entity = this.getOne(id);
      this.mainDatabaseService.delete(id);
      this.relatedDatabaseService.removeRelatedEntityFromMany(entity.id, entity[this.relatedField] as string[], this.mainField);
      return { message: `${String(this.mainField)} with id ${id} deleted` };
  }

  linkRelatedEntity(entityId: string, relatedId: string): MainType {
      this.getOne(entityId); // For validation
      this.mainDatabaseService.addRelatedEntity(entityId, relatedId, this.relatedField);
      this.relatedDatabaseService.addRelatedEntity(relatedId, entityId, this.mainField);
      return this.getOneWithRelated(entityId);
  }

  unlinkRelatedEntity(entityId: string, relatedId: string): MainType {
      this.getOne(entityId); // For validation
      this.mainDatabaseService.removeRelatedEntity(entityId, relatedId, this.relatedField);
      this.relatedDatabaseService.removeRelatedEntity(relatedId, entityId, this.mainField);
      return this.getOneWithRelated(entityId);
  }

  private validateRelatedEntity(id: string): void {
    const entity = this.relatedDatabaseService.findOne(id);
    if (!entity) throw new NotFoundException(`Cannot find ${String(this.relatedField)} with id ${id}`);
  }

  private validateRelatedEntities(ids: string[]): void {
    ids.forEach(id => this.validateRelatedEntity(id));
  }
}