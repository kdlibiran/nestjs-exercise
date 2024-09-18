import { OmitType } from '@nestjs/mapped-types';
import { Author } from 'src/types/data.interface';
import { IsString, IsArray } from 'class-validator';

export class CreateAuthorDto extends OmitType(Author, ['id']) {
    @IsArray({
        message: 'Books has to be an array.'
    })
    @IsString({
        each: true,
        message: 'Books has to be an array of strings.'
    })
    readonly books: string[];
}
