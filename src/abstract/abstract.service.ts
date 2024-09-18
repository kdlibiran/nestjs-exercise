import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractDatabaseService } from '../data/abstract-database.service';
import { IObjWithRelated } from '../types/data.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
//AbstactService () <mainType, RelationType, nameOfMain, nameOfRelation>
export class AbstractService<
  T extends IObjWithRelated<Y>,
  U extends IObjWithRelated<X>,
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

  findAll(): T[] {
    return this.mainDatabaseService.findAll();
  }

  findOne(id: string): T {
    const entity = this.mainDatabaseService.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Cannot find ${this.mainField} with id ${id}`);
    }
    return entity;
  }

  async findAllRelated(relatedIds: string[]): Promise<Omit<U,X>[]> {
    const relatedEntities: Promise<Omit<U,X>>[] = relatedIds.map(async (relatedId: string) => {
      const relatedEntity = this.relatedDatabaseService.findOne(relatedId);
      if (!relatedEntity) {
        throw new NotFoundException(`Cannot find related ${this.relatedField} with id ${relatedId}`);
      }
      const { [this.mainField]: _, ...omittedRelatedEntity } = relatedEntity;
      return omittedRelatedEntity;
    });
    return Promise.all(relatedEntities);
  }

  async create(createDto: Omit<T, 'id' | Y> & { [key in Y]: string[] }): Promise<T> {
    return this.withTransaction(async () => {
      const relatedEntities: Promise<Omit<U,X>>[] = createDto[this.relatedField].map(async (relatedId: string) => {
        return this.relatedDatabaseService.findOne(relatedId);
      });
      const entity = this.mainDatabaseService.create({ id: uuidv4(), ...createDto, [this.relatedField]: relatedEntities } as unknown as T);
      await this.updateRelatedEntities(entity.id, createDto[this.relatedField], 'add');
      return entity;
    });
  }

  async update(id: string, updateDto: Partial<Omit<T, 'id' | Y> & { [key in Y]: string[] }>): Promise<T> {
    return this.withTransaction(async () => {
      const entity = this.findOne(id);
      const relatedEntities: Promise<Omit<U,X>>[] = updateDto[this.relatedField].map(async (relatedId: string) => {
        return this.relatedDatabaseService.findOne(relatedId);
      });
      const updatedEntity = this.mainDatabaseService.update(id, { ...entity, ...updateDto, [this.relatedField]: relatedEntities });

      await this.updateRelatedEntities(entity.id, updateDto[this.relatedField], 'remove');
      await this.updateRelatedEntities(updatedEntity.id, updateDto[this.relatedField], 'add');
      return updatedEntity;
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    return this.withTransaction(async () => {
      const entity = this.findOne(id);
      await this.mainDatabaseService.delete(id);
      const relatedIds = entity[this.relatedField].map(related => related.id);
      await this.updateRelatedEntities(entity.id, relatedIds, 'remove');
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
            : relatedEntity[this.mainField].filter((related) => related.id !== entityId);
          await this.relatedDatabaseService.update(relatedId, { ...relatedEntity, [this.mainField]: updatedRelatedIds });
        } else if (mode === 'add') {
          throw new NotFoundException(`Cannot find related ${this.relatedField} with id ${relatedId}`);
        }
      })
    );
  }


  async addRelatedEntity(entityId: string, relatedId: string): Promise<T> {
    return this.withTransaction(async () => {
      const entity = this.findOne(entityId);
      const relatedEntity = this.relatedDatabaseService.findOne(relatedId);
      const { [this.mainField]: _, ...relatedEntityWithoutMainField } = relatedEntity;
      const updatedEntity = await this.mainDatabaseService.update(entityId, {
        ...entity,
        [this.relatedField]: [...entity[this.relatedField], relatedEntityWithoutMainField]
      });
      await this.updateRelatedEntities(entityId, [relatedId], 'add');
      return this.findOne(updatedEntity.id);
    });
  }

  async removeRelatedEntity(entityId: string, relatedId: string): Promise<T> {
    return this.withTransaction(async () => {
      const entity = this.findOne(entityId);
      const updatedEntity = await this.mainDatabaseService.update(entityId, {
        ...entity,
        [this.relatedField]: entity[this.relatedField].filter((related) => related.id !== relatedId)
      });
      await this.updateRelatedEntities(entityId, [relatedId], 'remove');
      return this.findOne(updatedEntity.id);
    });
  }
}