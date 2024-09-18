import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractDatabaseService } from '../data/abstract-database.service';
import { v4 as uuidv4 } from 'uuid';
import { IObj } from '../types/data.interface';

@Injectable()
export class AbstractService<
  MainType extends IObj,
  RelatedType extends IObj,
  ReturnType extends IObj
> {

  constructor(
    private readonly mainDatabaseService: AbstractDatabaseService<MainType>,
    private readonly relatedDatabaseService: AbstractDatabaseService<RelatedType>,
    private readonly mainField: string,
    private readonly relatedField: string,
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

  async create(createDto: Omit<MainType, "id">): Promise<ReturnType> {
    return this.withTransaction(async () => {
      const entity = this.mainDatabaseService.create({ ...createDto, id: uuidv4() } as unknown as MainType);
      await this.updateRelatedEntities(entity.id, entity[this.relatedField], 'add');
      return this.findOneWithRelated(entity.id);
    });
  }

  findAll(): MainType[] {
    return this.mainDatabaseService.findAll();
  }

  findOne(id: string): MainType {
    const entity = this.mainDatabaseService.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Cannot find ${this.mainField} with id ${id}`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<Omit<MainType, "id">>): Promise<ReturnType> {
    return this.withTransaction(async () => {
      const entity = this.findOne(id);
      const updatedEntity = this.mainDatabaseService.update(id, { ...entity, ...updateDto });

      if (entity !== updatedEntity) {
        await this.updateRelatedEntities(entity.id, entity[this.relatedField], 'remove');
        await this.updateRelatedEntities(updatedEntity.id, updatedEntity[this.relatedField], 'add');
      }

      return this.findOneWithRelated(updatedEntity.id);
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    return this.withTransaction(async () => {
      const entity = this.findOne(id);
      await this.mainDatabaseService.delete(id);
      await this.updateRelatedEntities(entity.id, entity[this.relatedField], 'remove');
      return { message: `${this.mainField} with id ${id} deleted` };
    });
  }

  private async updateRelatedEntities(
    entityId: string,
    relatedIds: string[],
    mode: 'add' | 'remove'
  ): Promise<void> {
    await Promise.all(
      relatedIds.map(async (relatedId) => {
        const relatedEntity = this.relatedDatabaseService.findOne(relatedId);
        if (relatedEntity) {
          const updatedRelatedIds = mode === 'add'
            ? [...relatedEntity[this.mainField], entityId]
            : relatedEntity[this.mainField].filter(id => id !== entityId);
          await this.relatedDatabaseService.update(relatedId, { ...relatedEntity, [this.mainField]: updatedRelatedIds });
        } else if (mode === 'add') {
          throw new NotFoundException(`Cannot find ${this.relatedField} with id ${relatedId}`);
        }
      })
    );
  }

  async addRelatedEntity(entityId: string, relatedId: string): Promise<ReturnType> {
    return this.withTransaction(async () => {
      const entity = this.findOne(entityId);
      const updatedEntity = await this.mainDatabaseService.update(entityId, {
        ...entity,
        [this.relatedField]: [...entity[this.relatedField], relatedId]
      });
      await this.updateRelatedEntities(entityId, [relatedId], 'add');
      return this.findOneWithRelated(updatedEntity.id);
    });
  }

  async removeRelatedEntity(entityId: string, relatedId: string): Promise<ReturnType> {
    return this.withTransaction(async () => {
      const entity = this.findOne(entityId);
      const updatedEntity = await this.mainDatabaseService.update(entityId, {
        ...entity,
        [this.relatedField]: entity[this.relatedField].filter(id => id !== relatedId)
      });
      await this.updateRelatedEntities(entityId, [relatedId], 'remove');
      return this.findOneWithRelated(updatedEntity.id);
    });
  }

  async findRelatedEntity(entityId: string): Promise<ReturnType[]> {
    const entity = this.findOne(entityId);
    return Promise.all(entity[this.relatedField].map(relatedId => {
      const relatedEntity = this.relatedDatabaseService.findOne(relatedId);
      if (!relatedEntity) {
        throw new NotFoundException(`Cannot find ${this.relatedField} with id ${relatedId}`);
      }
      return relatedEntity;
    }));
  }

  async findOneWithRelated(id: string): Promise<ReturnType> {
    const entity = this.findOne(id);
    const { [this.relatedField as keyof MainType]: relatedIds, ...entityWithoutRelatedIds } = entity;
    const relatedEntities = await this.findRelatedEntity(id);
    const relatedWithoutRelatedIds = relatedEntities.map(({ [this.mainField as keyof RelatedType]: relatedIds, ...rest }) => rest);
    return { 
      ...entityWithoutRelatedIds, 
      [this.relatedField as keyof ReturnType]: relatedWithoutRelatedIds 
    } as unknown as ReturnType;
  }

  async findAllWithRelated(): Promise<ReturnType[]> {
    const entities = this.findAll();
    return Promise.all(entities.map(entity => this.findOneWithRelated(entity.id)));
  }
}