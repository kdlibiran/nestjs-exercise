import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/abstract/abstract.service';
import { IAuthor, IBook, IBooksWithAuthors } from 'src/types/data.interface';
import { BooksDatabaseService } from 'src/data/books-database.service';
import { AuthorsDatabaseService } from 'src/data/authors-database.service';
@Injectable()
export class BooksService extends AbstractService<IBook, IAuthor, IBooksWithAuthors, "books", "authors"> {
  constructor(
    private readonly booksDatabaseService: BooksDatabaseService,
    private readonly authorsDatabaseService: AuthorsDatabaseService,
  ) {
    super(booksDatabaseService, authorsDatabaseService, "books", "authors");
  }
}