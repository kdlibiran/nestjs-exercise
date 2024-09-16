import {
    IsString,
    IsNotEmpty,
    ValidationArguments,
    IsOptional,
    IsInt,
    Max,
    IsArray
} from 'class-validator';

export class CreateBookDto {
    @IsNotEmpty({
        message: 'Title cannot be empty.'
    })
    @IsString({
        message: (args: ValidationArguments) =>
            `Title has to be a string, but was given ${args.value}.`
    })
    readonly title: string;

    @IsNotEmpty({
        message: 'Year cannot be empty.'
    })
    @IsInt({
        message: (args: ValidationArguments) =>
            `Year has to be an integer, but was given ${args.value}.`
    })
    @Max(new Date().getFullYear(), {
        message: (args: ValidationArguments) =>
            `Year cannot surpass the current year (${new Date().getFullYear()}), but was given ${args.value}.`
    })
    readonly year: number;

    @IsArray({
        message: 'Authors has to be an array.'
    })
    readonly authors: string[];
}

