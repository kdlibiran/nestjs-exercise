import { Injectable } from '@nestjs/common';
import { Data } from './database/data-reader.service';
import { AbstractDatabaseService } from './abstract-database.service';
import { IAuthor} from '../types/data.interface';

@Injectable()
export class AuthorsDatabaseService extends AbstractDatabaseService<IAuthor> {
    constructor() {
        super(Data.authors);
    }
}
