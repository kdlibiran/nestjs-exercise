export interface IObj {
    id: string;
}

export type IObjWithRelated<R extends string> = IObj & {
    [K in R]: TRelated<R>;
};

type TRelated<R extends string> = IObj[];

export interface IAuthor extends IObjWithRelated<'books'> {
    name: string;
    email: string;
}

export interface IBook extends IObjWithRelated<'authors'> {
    title: string;
    year: number;
}
export interface IAuthors {
    [id: string]: IAuthor;
}
export interface IBooks {
    [id: string]: IBook;
}

export interface IData {
    authors: IAuthors;
    books: IBooks;
}