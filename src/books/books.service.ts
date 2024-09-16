import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthorsDatabaseService } from 'src/data/authors-database.service';
import { BooksDatabaseService } from 'src/data/books-database.service';
import { v4 as uuidv4 } from 'uuid';
import {IBook, IAuthor} from '../types/data.interface';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class BooksService {
  constructor(private readonly booksDatabaseService: BooksDatabaseService, private readonly authorsDatabaseService: AuthorsDatabaseService) {}

  create(createBookDto: CreateBookDto): IBook {
    // Check if authors exist
    createBookDto.authors.forEach((authorId : string): void => {
      if (!this.authorsDatabaseService.findOne(authorId)) {
        throw new NotFoundException(`Error creating book. Cannot find author with id ${authorId}`);
      }
    });

    // Create the book if authors exist
    const book: IBook = this.booksDatabaseService.createBook({id: uuidv4(), ...createBookDto });

    createBookDto.authors.forEach((authorId : string): void => {
      this.authorsDatabaseService.addBookToAuthor(authorId, book.id);
    });

    return book;
  }

  findAll(): IBook[] {
    return this.booksDatabaseService.findAll();
  }

  findOne(id: string): IBook {
    const book: IBook = this.booksDatabaseService.findOne(id);
    if (!book) {
      throw new NotFoundException(`Error finding book. Cannot find book with id ${id}`);
    }
    return book;
  }

  update(id: string, updateBookDto: UpdateBookDto): IBook {
    // Check if book exists
    const book: IBook = this.booksDatabaseService.findOne(id);
    if (!book) {
      throw new NotFoundException(`Error updating book. Cannot find book with id ${id}`);
    }

    // Check if authors exist only if the authors have changed
    if (book.authors !== updateBookDto.authors) {
      updateBookDto.authors.forEach((authorId : string): void => {
        if (!this.authorsDatabaseService.findOne(authorId)) {
          throw new NotFoundException(`Error updating book. Cannot find author with id ${authorId}`);
        }
      });

      // Remove the book from all authors
      book.authors.forEach((authorId : string): void => {
        this.authorsDatabaseService.removeBookFromAuthor(authorId, book.id);
      });

      // Add the book to the new authors
      updateBookDto.authors.forEach((authorId : string): void => {
        this.authorsDatabaseService.addBookToAuthor(authorId, book.id);
      });
    }
    return this.booksDatabaseService.updateBook(id, { ...book, ...updateBookDto});
  }

  remove(id: string): {message: string} {
    const book: IBook = this.booksDatabaseService.findOne(id);
    if (!book) {
      throw new NotFoundException(`Error deleting book. Cannot find book with id ${id}`);
    }
    // Remove the book from all authors
    book.authors.forEach((authorId : string): void => {
      this.authorsDatabaseService.removeBookFromAuthor(authorId, book.id);
    });

    return {message: `Book with id ${id} deleted`};
  }

  findAuthors(bookId: string): IAuthor[] {
    const book: IBook = this.booksDatabaseService.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Error finding authors for book. Cannot find book with id ${bookId}`);
    }
    return book.authors.map((authorId: string): IAuthor => this.authorsDatabaseService.findOne(authorId));
  }

  addAuthorToBook(bookId: string, authorId: string): IBook {
    const book: IBook = this.booksDatabaseService.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Error adding author to book. Cannot find book with id ${bookId}`);
    }

    const author: IAuthor = this.authorsDatabaseService.findOne(authorId);
    if (!author) {
      throw new NotFoundException(`Error adding author to book. Cannot find author with id ${authorId}`);
    }

    this.booksDatabaseService.addAuthorToBook(bookId, authorId);
    this.authorsDatabaseService.addBookToAuthor(authorId, bookId);
    return this.booksDatabaseService.findOne(bookId);
  }

  removeAuthorFromBook(bookId: string, authorId: string): IBook {
    const book: IBook = this.booksDatabaseService.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Error removing author from book. Cannot find book with id ${bookId}`);
    }

    const author: IAuthor = this.authorsDatabaseService.findOne(authorId);
    if (!author) {
      throw new NotFoundException(`Error removing author from book. Cannot find author with id ${authorId}`);
    }

    this.booksDatabaseService.removeAuthorFromBook(bookId, authorId);
    this.authorsDatabaseService.removeBookFromAuthor(authorId, bookId);
    return this.booksDatabaseService.findOne(bookId);
  }
}
