import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/abstract/abstract.service';
import { Author, Book } from 'src/types/data.interface';
import { BooksDatabaseService } from 'src/data/books-database.service';
import { AuthorsDatabaseService } from 'src/data/authors-database.service';

@Injectable()
export class BooksService extends AbstractService<Book, Author> {
  constructor(
    private readonly booksDatabaseService: BooksDatabaseService,
    private readonly authorsDatabaseService: AuthorsDatabaseService,
  ) {
    super(booksDatabaseService, authorsDatabaseService, "books", "authors");
  }
}