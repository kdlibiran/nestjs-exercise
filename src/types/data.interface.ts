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

export type IObjWithRelated<T extends string> = IObj & {
    [key in T]: string[];
};

export type IAuthor = IObjWithRelated<"books"> & {
    name: string;
    email: string;
}

export type IBook = IObjWithRelated<"authors"> & {
    title: string;
    year: number;
}

export type ILibrary = IObjWithRelated<"books" | "authors"> & {
    name: string;
}

export type IObjectWithRelated<T extends IObjWithRelated<Y>, R extends IObjWithRelated<X>, X extends string, Y extends string> = Omit<T, keyof Y> & {
    [key in Y]: Omit<R, keyof X>[];
};

export type IBooksWithAuthors = IObjectWithRelated<IBook, IAuthor, "books", "authors">;
export type IAuthorsWithBooks = IObjectWithRelated<IAuthor, IBook, "authors", "books">;