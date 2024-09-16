import { Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorsDatabaseService } from '../data/authors-database.service';
import { BooksDatabaseService } from '../data/books-database.service';
import { v4 as uuidv4 } from 'uuid';
import { IAuthor, IBook } from '../types/data.interface';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class AuthorsService {
  constructor(private readonly authorsDatabaseService: AuthorsDatabaseService, private readonly booksDatabaseService: BooksDatabaseService) {}

  create(createAuthorDto: CreateAuthorDto): IAuthor {
    createAuthorDto.books.map(book => {
      const bookExists = this.booksDatabaseService.findOne(book);
      if (!bookExists) {
        throw new NotFoundException(`Error creating author. Cannot find book with id ${book}`);
      }
    });

    const author: IAuthor = this.authorsDatabaseService.createAuthor({...createAuthorDto, id: uuidv4()});

    author.books.map(book => {
      this.booksDatabaseService.addAuthorToBook(book, author.id);
    });

    return author;

  }

  findAll(): IAuthor[] {
    return this.authorsDatabaseService.findAll();
  }

  findOne(id: string): IAuthor {
    const author = this.authorsDatabaseService.findOne(id);
    if (!author) {
      throw new NotFoundException(`Error finding author. Cannot find author with id ${id}`);
    }
    return author;
  }

  update(id: string, updateAuthorDto: UpdateAuthorDto): IAuthor {
    const author = this.authorsDatabaseService.findOne(id);
    if (!author) {
      throw new NotFoundException(`Error updating author. Cannot find author with id ${id}`);
    }

    //check if all the books of the author exists
    updateAuthorDto.books.map(book => {
      const bookExists = this.booksDatabaseService.findOne(book);
      if (!bookExists) {
        throw new NotFoundException(`Error updating author. Cannot find book with id ${book}`);
      }
    });

    //update the author
    const updatedAuthor = this.authorsDatabaseService.updateAuthor(id, {...author , ...updateAuthorDto,});

    //remove the author from all the books
    author.books.map(book => {
      this.booksDatabaseService.removeAuthorFromBook(book, author.id);
    });

    //add the author to all the books
    updatedAuthor.books.map(book => {
      this.booksDatabaseService.addAuthorToBook(book, updatedAuthor.id);
    });

    return updatedAuthor;
  }

  remove(id: string): {message : string} {
    const author = this.authorsDatabaseService.findOne(id);
    if (!author) {
      throw new NotFoundException(`Error deleting author. Cannot find author with id ${id}`);
    }

    this.authorsDatabaseService.deleteAuthor(id);

    //remove the author from all the books
    author.books.map(book => {
      this.booksDatabaseService.removeAuthorFromBook(book, author.id);
    });


    return {message: `Author with id ${id} deleted`};
  }

  findBooks(authorId: string): IBook[] {
    const author = this.authorsDatabaseService.findOne(authorId);
    if (!author) {
      throw new NotFoundException(`Error finding books for author. Cannot find author with id ${authorId}`);
    }
    return author.books.map((bookId: string): IBook => this.booksDatabaseService.findOne(bookId));
  }

  addBookToAuthor(authorId: string, bookId: string): IAuthor {
    const author = this.authorsDatabaseService.findOne(authorId);
    if (!author) {
      throw new NotFoundException(`Error adding book to author. Cannot find author with id ${authorId}`);
    }

    const book = this.authorsDatabaseService.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Error adding book to author. Cannot find book with id ${bookId}`);
    }

    this.authorsDatabaseService.addBookToAuthor(authorId, bookId);
    this.booksDatabaseService.addAuthorToBook(bookId, authorId);
    return this.authorsDatabaseService.findOne(authorId);
  }

  removeBookFromAuthor(authorId: string, bookId: string): IAuthor {
    const author = this.authorsDatabaseService.findOne(authorId);
    if (!author) {
      throw new NotFoundException(`Error removing book to author. Cannot find author with id ${authorId}`);
    }

    const book = this.authorsDatabaseService.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Error removing book to author. Cannot find book with id ${bookId}`);
    }

    this.authorsDatabaseService.removeBookFromAuthor(authorId, bookId);
    this.booksDatabaseService.removeAuthorFromBook(bookId, authorId);
    return this.authorsDatabaseService.findOne(authorId);
  }
}
