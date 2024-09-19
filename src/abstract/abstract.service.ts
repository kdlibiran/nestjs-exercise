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

  findOne(id: string): MainType {
    const entity = this.mainDatabaseService.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Cannot find ${String(this.mainField)} with id ${id}`);
    }
    return entity;
  }

  findAll(): MainType[] {
    return this.mainDatabaseService.findAll();
  }

  findOneComplete(id: string): MainType {
    const entity = this.findOne(id);
    const relatedEntities = this.relatedDatabaseService.findAllByRelatedFieldId(this.mainField, id);
    return { ...entity, [this.relatedField]: relatedEntities };
  }

  findAllComplete(): MainType[] {
    const entities = this.mainDatabaseService.findAll();
    return entities.map(entity => this.findOneComplete(entity.id));
  }

  create(createDto: Omit<MainType, "id">): MainType {
    this.findAllFromRelated(createDto[this.relatedField as string]); // For validation
    const entity = this.mainDatabaseService.create({ id: uuidv4(), ...createDto } as MainType);
    this.relatedDatabaseService.addRelatedEntityToMany(entity.id, createDto[this.relatedField as string], this.mainField);
    return this.findOneComplete(entity.id);
  }

  update(id: string, updateDto: Partial<Omit<MainType, "id">>): MainType {
      const entity = this.findOne(id);
      this.findAllFromRelated(updateDto[this.relatedField as string]); // For validation
      const updatedEntity = this.mainDatabaseService.update(id, { ...entity, ...updateDto });
      if (entity[this.relatedField] !== updatedEntity[this.relatedField]) {
        this.relatedDatabaseService.removeRelatedEntityFromMany(entity.id, entity[this.relatedField] as string[], this.mainField);
        this.relatedDatabaseService.addRelatedEntityToMany(entity.id, updatedEntity[this.relatedField] as string[], this.mainField);
      }
      return this.findOneComplete(updatedEntity.id);
  }

  remove(id: string): { message: string } {
      const entity = this.findOne(id);
      this.mainDatabaseService.delete(id);
      this.relatedDatabaseService.removeRelatedEntityFromMany(entity.id, entity[this.relatedField] as string[], this.mainField);
      return { message: `${String(this.mainField)} with id ${id} deleted` };
  }

  addRelatedEntity(entityId: string, relatedId: string): MainType {
      this.findOne(entityId); // For validation
      this.mainDatabaseService.addRelatedEntity(entityId, relatedId, this.relatedField);
      this.relatedDatabaseService.addRelatedEntity(relatedId, entityId, this.mainField);
      return this.findOneComplete(entityId);
  }

  removeRelatedEntity(entityId: string, relatedId: string): MainType {
      this.findOne(entityId); // For validation
      this.mainDatabaseService.removeRelatedEntity(entityId, relatedId, this.relatedField);
      this.relatedDatabaseService.removeRelatedEntity(relatedId, entityId, this.mainField);
      return this.findOneComplete(entityId);
  }

  findOneFromRelated(id: string): void { // Only used for validation
    const entity = this.relatedDatabaseService.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Cannot find ${String(this.relatedField)} with id ${id}`);
    }
  }

  findAllFromRelated(ids: string[]): void { // Only used for validation
    ids.forEach(id => this.findOneFromRelated(id));
  }
}