import {
    IsString,
    IsNotEmpty,
    IsInt,
    Max,
    IsArray
} from 'class-validator';

export class CreateBookDto {
    @IsNotEmpty({
        message: 'Title cannot be empty.'
    })
    @IsString({
        message: `Title has to be a string.`
    })
    readonly title: string;

    @IsNotEmpty({
        message: 'Year cannot be empty.'
    })
    @IsInt({
        message: `Year has to be an integer.`
    })
    @Max(new Date().getFullYear(), {
        message: `Year cannot be greater than the current year.`
    })
    readonly year: number;

    @IsArray({
        message: 'Authors has to be an array.'
    })
    readonly authors: string[];
}

