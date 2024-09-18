import { Injectable } from '@nestjs/common';
import { AbstractObject } from '../types/data.interface';

@Injectable()
export class AbstractDatabaseService<Type extends AbstractObject> {
    private array: { [key: string]: Type } = {};
    private transactionArray: { [key: string]: Type } | null = null;

    constructor(initialArray: { [key: string]: Type } = {}) {
        this.array = { ...initialArray };
    }

    private getArray(): { [key: string]: Type } {
        return this.transactionArray || this.array;
    }

    findOne(id: string): Type {
        return this.getArray()[id];
    }

    findOneWithoutRelatedField(id: string, relatedField: keyof Type): Omit<Type, keyof Type> {
        const { [relatedField as keyof Type]: relatedIds, ...entityWithoutRelatedIds } = this.findOne(id);
        return entityWithoutRelatedIds;
    }

    findAll(): Type[] {
        return Object.values(this.getArray());
    }

    findAllByProperty(property: keyof Type, value: any): Type[] {
        return Object.values(this.getArray()).filter((obj: Type) => obj[property] === value);
    }

    findRelatedEntities(relatedField: keyof Type, relatedId: string): Omit<Type, keyof Type>[] {
        return Object.values(this.getArray())
            .filter((obj: Type) => (obj[relatedField] as string[])
            .includes(relatedId))
            .map(({ [relatedField]: relatedIds, ...rest }) => rest);
    }

    create(obj: Type): Type {
        const targetArray = this.getArray();
        targetArray[obj.id] = obj;
        return obj;
    }

    update(id: string, obj: Type): Type {
        const targetArray = this.getArray();
        targetArray[id] = obj;
        return obj;
    }

    delete(id: string): void {
        const targetArray = this.getArray();
        delete targetArray[id];
    }

    addRelatedEntity(entityId: string, relatedId: string, relatedField: keyof Type): void {
        const targetArray = this.getArray();
        const entity = targetArray[entityId];
        (entity[relatedField] as string[]).push(relatedId);
        targetArray[entityId] = entity;
    }

    removeRelatedEntity(entityId: string, relatedId: string, relatedField: keyof Type): void {
        const targetArray = this.getArray();
        const entity = targetArray[entityId];
        (entity[relatedField] as string[]).splice((entity[relatedField] as string[]).indexOf(relatedId), 1);
        targetArray[entityId] = entity;
    }

    async addRelatedEntities(relatedId: string, entityIds: string[], relatedField: keyof Type): Promise<void> {
        entityIds.forEach(entityId => this.addRelatedEntity(entityId, relatedId, relatedField));
    }

    async removeRelatedEntities(relatedId: string, entityIds: string[], relatedField: keyof Type): Promise<void> {
        entityIds.forEach(entityId => this.removeRelatedEntity(entityId, relatedId, relatedField));
    }

    startTransaction(): void {
        if (this.transactionArray) {
            throw new Error('Transaction already in progress');
        }
        this.transactionArray = { ...this.array };
    }

    commit(): void {
        if (!this.transactionArray) {
            throw new Error('No transaction in progress');
        }
        this.array = this.transactionArray;
        this.transactionArray = null;
    }

    rollback(): void {
        if (!this.transactionArray) {
            throw new Error('No transaction in progress');
        }
        this.transactionArray = null;
    }
}
