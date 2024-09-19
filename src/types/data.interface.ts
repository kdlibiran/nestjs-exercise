import { IsString, IsEmail, IsNotEmpty, IsArray, IsInt, Max } from 'class-validator';

export interface Identifiable {
    id: string;
}

export class AbstractObject implements Identifiable {
    id!: string;
}

export class Book extends AbstractObject {
    @IsString({
        message: `Title has to be a string`
    })
    @IsNotEmpty({
        message: 'Title cannot be empty.'
    })
    title!: string;
    @IsNotEmpty({
        message: 'Year cannot be empty.'
    })
    @IsInt({
        message: `Year has to be an integer.`
    })
    @Max(new Date().getFullYear(), {
        message: `Year cannot be greater than the current year.`
    })
    year!: number;
    @IsArray({
        message: 'Authors has to be an array.'
    })
    authors!: string[] | Omit<Author, "books">[];
}

export class Author extends AbstractObject {
    @IsNotEmpty({
        message: 'Name cannot be empty.'
    })
    @IsString({
        message: `Name has to be a string`
    })
    name!: string;
    
    @IsString()
    @IsNotEmpty({
        message: 'Email cannot be empty.'
    })
    @IsString({
        message: `Email has to be a string`
    })
    @IsEmail({}, {
        message: 'Email is not valid.'
    })
    email!: string;
    @IsArray({
        message: 'Books has to be an array.'
    })
    books!: string[] | Omit<Book, "authors">[];
}

export interface IAuthors {
    [id: string]: Author;
}
export interface IBooks {
    [id: string]: Book;
}
export interface IData {
    authors: IAuthors;
    books: IBooks;
}