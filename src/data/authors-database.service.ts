import { Injectable } from '@nestjs/common';
import { Data } from './database/data-reader.service';
import { AbstractDatabaseService } from './abstract-database.service';
import { Author} from '../types/data.interface';

@Injectable()
export class AuthorsDatabaseService extends AbstractDatabaseService<Author> {
    constructor() {
        super(Data.authors);
    }
}
