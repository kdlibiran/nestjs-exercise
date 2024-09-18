import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/abstract/abstract.service';
import { IAuthor, IAuthorsWithBooks, IBook } from 'src/types/data.interface';
import { BooksDatabaseService } from 'src/data/books-database.service';
import { AuthorsDatabaseService } from 'src/data/authors-database.service';

@Injectable()
export class AuthorsService extends AbstractService<IAuthor, IBook, IAuthorsWithBooks> {
  constructor(
    private readonly authorsDatabaseService: AuthorsDatabaseService,
    private readonly booksDatabaseService: BooksDatabaseService,
  ) {
    super(authorsDatabaseService, booksDatabaseService, "authors", "books");
  }
}