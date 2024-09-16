import { Injectable } from '@nestjs/common';
import { Data } from './database/data-reader.service';
import { IBooks,IBook, IAuthors, IAuthor } from '../types/data.interface';

@Injectable()
export class BooksDatabaseService {
    private books: IBooks = Data.books;
    private authors: IAuthors = Data.authors;

    createBook(book: IBook): IBook {
        this.books[book.id] = book;
        return book;
    }

    findAll(): IBook[] {
        return Object.values(this.books);
    }

    findOne(id: string): IBook {
        return this.books[id];
    }

    updateBook(id: string, book: IBook): IBook {
        this.books[id] = book;
        return book;
    }

    deleteBook(id: string): void {
        delete this.books[id];
    }

    findAuthorsByBook(id: string): IAuthor[] {
        const book: IBook = this.findOne(id);
        const authors: IAuthor[] = book.authors.map((authorId : string): IAuthor => this.authors[authorId]);
        return authors;
    }

    addAuthorToBook(bookId: string, authorId: string): void {
        const book: IBook = this.findOne(bookId);
        book.authors.push(authorId);
        this.updateBook(bookId, book);
    }

    removeAuthorFromBook(bookId: string, authorId: string): void {
        const book: IBook = this.findOne(bookId);
        book.authors = book.authors.filter((author : string): Boolean => author !== authorId);
        this.updateBook(bookId, book);
    }
}
