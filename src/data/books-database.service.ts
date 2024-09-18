import { Injectable } from '@nestjs/common';
import { Data } from './database/data-reader.service';
import { AbstractDatabaseService } from './abstract-database.service';
import { Book } from '../types/data.interface';

@Injectable()
export class BooksDatabaseService extends AbstractDatabaseService<Book> {
    constructor() {
        super(Data.books);
    }
}