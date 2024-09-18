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

  private async withTransaction<R>(action: () => Promise<R>): Promise<R> {
    this.mainDatabaseService.startTransaction();
    try {
      const result = await action();
      this.mainDatabaseService.commit();
      return result;
    } catch (error) {
      this.mainDatabaseService.rollback();
      throw error;
    }
  }

  //Return the entity with the related field as an array of ids
  findOne(id: string): MainType {
    const entity = this.mainDatabaseService.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Cannot find ${String(this.mainField)} with id ${id}`);
    }
    return entity;
  }
  
  //Return the entity with the related field as an array of ids
  findAll(): MainType[] {
    return this.mainDatabaseService.findAll();
  }

  //Return the entity with the related field as an array of ids
  findOneComplete(id: string): MainType {
    const { [this.relatedField]: relatedField, ...entity } = this.mainDatabaseService.findOne(id)
    const relatedEntities = this.relatedDatabaseService.findRelatedEntitiesWithoutRelated(this.mainField, id);
    return { ...entity, [this.relatedField]: relatedEntities } as unknown as MainType;
  }

  //Return all entities with the related field as an array of ids
  findAllComplete(): MainType[] {
    const entities = this.mainDatabaseService.findAll();
    return entities.map(entity => this.findOneComplete(entity.id));
  }

  async create(createDto: Omit<MainType, "id">): Promise<MainType> {
    return this.withTransaction(async () => {
      const entity = this.mainDatabaseService.create({ ...createDto, id: uuidv4() } as unknown as MainType);
      await this.relatedDatabaseService.addRelatedEntities(entity.id, createDto[this.relatedField as string], this.mainField);
      return this.findOneComplete(entity.id);
    });
  }

  async update(id: string, updateDto: Partial<Omit<MainType, "id">>): Promise<MainType> {
    return this.withTransaction(async () => {
      const entity = this.findOne(id);
      const updatedEntity = this.mainDatabaseService.update(id, { ...entity, ...updateDto });

      //If the entity has changed, remove the related entities and add the new ones
      if (entity !== updatedEntity) {
        await this.relatedDatabaseService.removeRelatedEntities(entity.id, entity[this.relatedField] as string[], this.mainField);
        await this.relatedDatabaseService.addRelatedEntities(updatedEntity.id, updatedEntity[this.relatedField] as string[], this.mainField);
      }

      return this.findOneComplete(updatedEntity.id);
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    return this.withTransaction(async () => {
      const entity = this.findOne(id);
      this.mainDatabaseService.delete(id);
      await this.relatedDatabaseService.removeRelatedEntities(entity.id, entity[this.relatedField] as string[], this.mainField);
      return { message: `${String(this.mainField)} with id ${id} deleted` };
    });
  }

  async addRelatedEntity(entityId: string, relatedId: string): Promise<MainType> {
    return this.withTransaction(async () => {
      const entity = this.findOne(entityId);
      const updatedEntity = await this.mainDatabaseService.update(entityId, {
        ...entity,
        [this.relatedField]: [...entity[this.relatedField] as string[], relatedId]
      });
      await this.relatedDatabaseService.addRelatedEntity(relatedId, entityId, this.mainField);
      return this.findOneComplete(updatedEntity.id);
    });
  }

  async removeRelatedEntity(entityId: string, relatedId: string): Promise<MainType> {
    return this.withTransaction(async () => {
      const entity = this.findOne(entityId);
      const updatedEntity = await this.mainDatabaseService.update(entityId, {
        ...entity,
        [this.relatedField]: (entity[this.relatedField] as string[]).filter(id => id !== relatedId)
      });
      await this.relatedDatabaseService.removeRelatedEntity(relatedId, entityId, this.mainField);
      return this.findOneComplete(updatedEntity.id);
    });
  }
}