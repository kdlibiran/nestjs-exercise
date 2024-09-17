import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractDatabaseService } from '../data/abstract-database.service';
import { IObjWithRelated, IObjectWithRelated } from '../types/data.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
//AbstactService () <mainType, RelationType, mainWithRelationType, nameOfMain, nameOfRelation>
//Those with T returns are usually just helper functions to make the code more readable
//The ones with V returns are the ones that are used in the controllers
export class AbstractService<
  T extends IObjWithRelated<Y>,
  U extends IObjWithRelated<X>,
  V extends IObjectWithRelated<T, U, X, Y>,
  X extends string,
  Y extends string
> {
  constructor(
    private readonly mainDatabaseService: AbstractDatabaseService<T, Y>,
    private readonly relatedDatabaseService: AbstractDatabaseService<U, X>,
    private readonly mainField: X,
    private readonly relatedField: Y,
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

  async create(createDto: Omit<T, 'id'>): Promise<V> {
    return this.withTransaction(async () => {
      const entity = this.mainDatabaseService.create({ ...createDto, id: uuidv4() } as T);
      await this.updateRelatedEntities(entity.id, entity[this.relatedField], 'add');
      return this.findOneWithRelated(entity.id);
    });
  }

  findAll(): T[] {
    return this.mainDatabaseService.findAll();
  }

  findOne(id: string): T {
    const entity = this.mainDatabaseService.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Cannot find entity with id ${id}`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<T>): Promise<V> {
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
      return { message: `Entity with id ${id} deleted` };
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
          throw new NotFoundException(`Cannot find related entity with id ${relatedId}`);
        }
      })
    );
  }

  async addRelatedEntity(entityId: string, relatedId: string): Promise<V> {
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

  async removeRelatedEntity(entityId: string, relatedId: string): Promise<V> {
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

  async findRelatedEntity(entityId: string): Promise<U[]> {
    const entity = this.findOne(entityId);
    return Promise.all(entity[this.relatedField].map(relatedId => this.relatedDatabaseService.findOne(relatedId)));
  }

  async findOneWithRelated(id: string): Promise<V> {
    const entity = this.findOne(id);
    const { [this.relatedField]: relatedIds, ...entityWithoutRelatedIds } = entity;
    const relatedEntities = await this.findRelatedEntity(id);
    const relatedWithoutRelatedIds = relatedEntities.map(({ [this.mainField]: relatedIds, ...rest }) => rest);
    return { ...entityWithoutRelatedIds, [this.relatedField]: relatedWithoutRelatedIds } as unknown as V;
  }

  async findAllWithRelated(): Promise<V[]> {
    const entities = this.findAll();
    return Promise.all(entities.map(entity => this.findOneWithRelated(entity.id)));
  }
}