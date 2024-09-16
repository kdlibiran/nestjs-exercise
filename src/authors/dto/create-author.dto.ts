import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateAuthorDto {
    @ApiProperty({
        description: 'The name of the author',
        type: 'string',
        example: 'John Doe'
    })
    @IsNotEmpty({
        message: 'Name cannot be empty.'
    })
    @IsString({
        message: `Name has to be a string`
    })
    readonly name: string;

    @ApiProperty({
        description: 'The email of the author',
        format: 'email',
        type: 'string',
        example: 'john.doe@example.com'
    })
    @IsNotEmpty({
        message: 'Email cannot be empty.'
    })
    @IsString({
        message: `Email has to be a string`
    })
    @IsEmail({}, {
        message: 'Email is not valid.'
    })
    readonly email: string;

    @ApiProperty({
        description: 'The id of the books of the author',
        type: [String],
        example: ["a1c4ef2b-12d7-45f3-a1aa-09fc8fdc9efb","2b18c684-2d15-4b98-95a7-3ef9d914d015"]
    })
    @IsArray({
        message: 'Books has to be an array.'
    })
    readonly books: string[];
}
