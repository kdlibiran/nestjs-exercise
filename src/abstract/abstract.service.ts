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
  //Helpers
  findOneFromRelated(id: string): void { // Only used for validation
    const entity = this.relatedDatabaseService.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Cannot find ${String(this.relatedField)} with id ${id}`);
    }
  }

  findAllFromRelated(ids: string[]): void { // Only used for validation
    for (const id of ids) {
      this.findOneFromRelated(id);
    }
  }

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
    const { [this.relatedField]: relatedField, ...entity } = this.findOne(id);
    const relatedEntities = this.relatedDatabaseService.findRelatedEntities(this.mainField, id);
    return { ...entity, [this.relatedField]: relatedEntities } as unknown as MainType;
  }

  findAllComplete(): MainType[] {
    const entities = this.mainDatabaseService.findAll();
    return entities.map(entity => this.findOneComplete(entity.id));
  }

  create(createDto: Omit<MainType, "id">): MainType {
    this.findAllFromRelated(createDto[this.relatedField as string]); // For validation
    const entity = this.mainDatabaseService.create({ ...createDto, id: uuidv4() } as unknown as MainType);
    this.relatedDatabaseService.addRelatedEntities(entity.id, createDto[this.relatedField as string], this.mainField);
    return this.findOneComplete(entity.id);
  }

  update(id: string, updateDto: Partial<Omit<MainType, "id">>): MainType {
      const entity = this.findOne(id);
      this.findAllFromRelated(updateDto[this.relatedField as string]); // For validation
      const updatedEntity = this.mainDatabaseService.update(id, { ...entity, ...updateDto });
      if (entity !== updatedEntity) {
        this.relatedDatabaseService.removeRelatedEntities(entity.id, entity[this.relatedField] as string[], this.mainField);
        this.relatedDatabaseService.addRelatedEntities(updatedEntity.id, updatedEntity[this.relatedField] as string[], this.mainField);
      }
      return this.findOneComplete(updatedEntity.id);
  }

  remove(id: string): { message: string } {
      const entity = this.findOne(id);
      this.mainDatabaseService.delete(id);
      this.relatedDatabaseService.removeRelatedEntities(entity.id, entity[this.relatedField] as string[], this.mainField);
      return { message: `${String(this.mainField)} with id ${id} deleted` };
  }

  addRelatedEntity(entityId: string, relatedId: string): MainType {
      const entity = this.findOne(entityId);
      this.findOneFromRelated(relatedId); //For validation
      const updatedEntity = this.mainDatabaseService.update(entityId, {
        ...entity,
        [this.relatedField]: [...entity[this.relatedField] as string[], relatedId]
      });
      this.relatedDatabaseService.addRelatedEntity(relatedId, entityId, this.mainField);
      return this.findOneComplete(updatedEntity.id);
  }

  removeRelatedEntity(entityId: string, relatedId: string): MainType {
      const entity = this.findOne(entityId);
      const updatedEntity = this.mainDatabaseService.update(entityId, {
        ...entity,
        [this.relatedField]: (entity[this.relatedField] as string[]).filter(id => id !== relatedId)
      });
      this.relatedDatabaseService.removeRelatedEntity(relatedId, entityId, this.mainField);
      return this.findOneComplete(updatedEntity.id);
  }
}