import { Injectable } from '@nestjs/common';
import { IObj } from '../types/data.interface';

@Injectable()
export class AbstractDatabaseService<Type extends IObj> {
    private array: { [key: string]: Type } = {};
    private transactionArray: { [key: string]: Type } | null = null;

    constructor(initialArray: { [key: string]: Type } = {}) {
        this.array = { ...initialArray };
    }

    private getArray(): { [key: string]: Type } {
        return this.transactionArray || this.array;
    }

    create(obj: Type): Type {
        const targetArray = this.getArray();
        targetArray[obj.id] = obj;
        return obj;
    }

    findAll(): Type[] {
        return Object.values(this.getArray());
    }

    findAllByProperty(property: keyof Type, value: any): Type[] {
        return Object.values(this.getArray()).filter((obj: Type) => obj[property] === value);
    }

    findOne(id: string): Type {
        return this.getArray()[id];
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
