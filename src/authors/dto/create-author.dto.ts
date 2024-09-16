import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsArray,
    ValidationArguments
} from 'class-validator';

export class CreateAuthorDto {
    @IsNotEmpty({
        message: 'Name cannot be empty.'
    })
    @IsString({
        message: (args: ValidationArguments) =>
            `Name has to be a string, but was given ${args.value}.`
    })
    readonly name: string;

    @IsNotEmpty({
        message: 'Email cannot be empty.'
    })
    @IsString({
        message: (args: ValidationArguments) =>
            `Email has to be a string, but was given ${args.value}.`
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
