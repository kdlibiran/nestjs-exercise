import { Injectable } from '@nestjs/common';
import { IObjWithRelated } from '../types/data.interface';

@Injectable()
export class AbstractDatabaseService<T extends IObjWithRelated<U>, U extends string> {
    private array: { [key: string]: T } = {};
    private transactionArray: { [key: string]: T } | null = null;

    constructor(initialArray: { [key: string]: T } = {}, relatedId: U) {
        this.array = { ...initialArray };
    }

    private getArray(): { [key: string]: T } {
        return this.transactionArray || this.array;
    }

    create(obj: T): T {
        const targetArray = this.getArray();
        targetArray[obj.id] = obj;
        return obj;
    }

    findAll(): T[] {
        return Object.values(this.getArray());
    }

    findAllByProperty(property: keyof T, value: any): T[] {
        return Object.values(this.getArray()).filter((obj: T) => obj[property] === value);
    }

    findOne(id: string): T {
        return this.getArray()[id];
    }

    update(id: string, obj: T): T {
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
