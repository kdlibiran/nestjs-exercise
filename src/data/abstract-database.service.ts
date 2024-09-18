import { Injectable } from '@nestjs/common';
import { AbstractObject } from '../types/data.interface';

@Injectable()
export class AbstractDatabaseService<Type extends AbstractObject> {
    private data: { [key: string]: Type } = {};

    constructor(initialData: { [key: string]: Type } = {}) {
        this.data = { ...initialData };
    }

    findOne(id: string): Type {
        return this.data[id];
    }
    findAll(): Type[] {
        return Object.values(this.data);
    }

    findAllByProperty(property: keyof Type, value: any): Type[] {
        return Object.values(this.data).filter((obj: Type) => obj[property] === value);
    }

    findRelatedEntities(relatedField: keyof Type, relatedId: string): Omit<Type, keyof Type>[] {
        return Object.values(this.data)
            .filter((obj: Type) => (obj[relatedField] as string[])
            .includes(relatedId))
            .map(({ [relatedField]: relatedIds, ...rest }) => rest);
    }

    create(obj: Type): Type {
        this.data[obj.id] = obj;
        return obj;
    }

    update(id: string, obj: Type): Type {
        this.data[id] = obj;
        return obj;
    }

    delete(id: string): void {
        delete this.data[id];
    }

    addRelatedEntity(entityId: string, relatedId: string, relatedField: keyof Type): void {
        const entity = this.data[entityId];
        (entity[relatedField] as string[]).push(relatedId);
        this.data[entityId] = entity;
    }

    removeRelatedEntity(entityId: string, relatedId: string, relatedField: keyof Type): void {
        const entity = this.data[entityId];
        (entity[relatedField] as string[]).splice((entity[relatedField] as string[]).indexOf(relatedId), 1);
        this.data[entityId] = entity;
    }

    addRelatedEntities(relatedId: string, entityIds: string[], relatedField: keyof Type): void {
        entityIds.forEach(entityId => this.addRelatedEntity(entityId, relatedId, relatedField));
    }

    removeRelatedEntities(relatedId: string, entityIds: string[], relatedField: keyof Type): void {
        entityIds.forEach(entityId => this.removeRelatedEntity(entityId, relatedId, relatedField));
    }
}