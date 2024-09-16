export interface IData {
    authors: IAuthors;
    books: IBooks;
}

export interface IAuthors {
    [id: string]: IAuthor;
}

export interface IBooks {
    [id: string]: IBook;
}

export interface IAuthor {
    id: string;
    name: string;
    email: string;
    books: string[];
}

export interface IBook {
    id: string;
    title: string;
    year: number;
    authors: string[];
}