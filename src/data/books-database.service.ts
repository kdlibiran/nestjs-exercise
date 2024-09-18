import { Injectable } from '@nestjs/common';
import { Data } from './database/data-reader.service';
import { AbstractDatabaseService } from './abstract-database.service';
import { IBook } from '../types/data.interface';

@Injectable()
export class BooksDatabaseService extends AbstractDatabaseService<IBook> {
    constructor() {
        super(Data.books);
    }
}