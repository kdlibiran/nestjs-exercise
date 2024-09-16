import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsArray
} from 'class-validator';

export class CreateAuthorDto {
    @IsNotEmpty({
        message: 'Name cannot be empty.'
    })
    @IsString({
        message: `Name has to be a string`
    })
    readonly name: string;

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

    @IsArray({
        message: 'Books has to be an array.'
    })
    readonly books: string[];
}
