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

    findAllByRelatedFieldId(relatedField: keyof Type, relatedId: string): Omit<Type, keyof Type>[] {
        return Object.values(this.data)
            .filter((obj: Type) => (obj[relatedField] as string[]).includes(relatedId))
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
        (entity[relatedField] as string[]).filter(id => id !== relatedId);
        this.data[entityId] = entity;
    }

    addRelatedEntityToMany(entityId:string, relatedIds: string[], relatedField: keyof Type): void {
        relatedIds.forEach(relatedId => this.addRelatedEntity(relatedId, entityId, relatedField))
    }

    removeRelatedEntityFromMany(entityId:string, relatedIds: string[], relatedField: keyof Type): void {
        relatedIds.forEach(relatedId => this.removeRelatedEntity(relatedId, entityId, relatedField))
    }
}