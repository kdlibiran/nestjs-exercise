import { Injectable } from '@nestjs/common';
import { Data } from './database/data-reader.service';
import { IAuthors, IBooks, IAuthor, IBook} from '../types/data.interface';

@Injectable()
export class AuthorsDatabaseService {
    private readonly authors: IAuthors = Data.authors;
    private readonly books: IBooks = Data.books;

    createAuthor(author: IAuthor): IAuthor {
        this.authors[author.id] = author;
        return author;
    }

    findAll(): IAuthor[] {
        return Object.values(this.authors);
    }

    findOne(id: string): IAuthor {
        const author: IAuthor = this.authors[id];
        return author;
    }

    updateAuthor(id: string, author: IAuthor): IAuthor {
        this.authors[id] = author;
        return author;
    }

    deleteAuthor(id: string): void {
        delete this.authors[id];
    }

    findBooksByAuthor(id: string): IBook[] {
        const author: IAuthor = this.findOne(id);
        const books: IBook[] = author.books.map((bookId : string): IBook => this.books[bookId]);
        return books;
    }

    addBookToAuthor(authorId: string, bookId: string): void {
        const author: IAuthor = this.findOne(authorId);
        author.books.push(bookId);
        this.updateAuthor(authorId, author);
    }

    removeBookFromAuthor(authorId: string, bookId: string): void {
        const author: IAuthor = this.findOne(authorId);
        author.books = author.books.filter((book : string): Boolean => book !== bookId);
        this.updateAuthor(authorId, author);
    }
}
