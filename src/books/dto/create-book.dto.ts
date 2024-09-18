import {
    IsString,
    IsNotEmpty,
    IsInt,
    Max,
    IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IBook } from 'src/types/data.interface';

export class CreateBookDto implements Omit<IBook, "id"> {
    @ApiProperty({
        description: 'The title of the book',
        example: 'The Great Gatsby'
    })
    @IsNotEmpty({
        message: 'Title cannot be empty.'
    })
    @IsString({
        message: `Title has to be a string.`
    })
    readonly title: string;

    @ApiProperty({
        description: 'The year the book was published',
        maximum: new Date().getFullYear(),
        example: 1925
    })
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

    @ApiProperty({
        description: 'The id of the authors of the book',
        type: [String],
        example: ["649ac8bc-c13b-4698-9b89-1ebfb12f6401", "869be08d-b46b-4899-9b5f-d14bc1b0fd0b"]
    })
    @IsArray({
        message: 'Authors has to be an array.'
    })
    readonly authors: string[];
}

