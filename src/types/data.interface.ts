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
export interface IObj {
    id: string;
}

export type IAuthor = IObj & {
    name: string;
    email: string;
    books: string[];
}

export type IBook = IObj & {
    title: string;
    year: number;
    authors: string[];
}

export type IBooksWithAuthors = Omit<IBook, "authors"> & {
    authors: Omit<IAuthor, "books">[];
};
export type IAuthorsWithBooks = Omit<IAuthor, "books"> & {
    books: Omit<IBook, "authors">[];
};