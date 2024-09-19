import { Controller, Post, Param, Delete, Body, Patch } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Author, Book } from 'src/types/data.interface';
import { AbstractController } from 'src/abstract/abstract.controller';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Controller('authors')
export class AuthorsController extends AbstractController<Author, Book> {
  constructor(private readonly authorsService: AuthorsService) {
    super(authorsService);
  }

  @Post()
  create(@Body() createDto: CreateAuthorDto): Author {
    return this.authorsService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAuthorDto): Author {
    return this.authorsService.update(id, updateDto);
  }

  @Post(':id/books/:bookId')
  addBook(@Param('id') id: string, @Param('bookId') bookId: string): Author {
    return this.authorsService.linkRelatedEntity(id, bookId);
  }

  @Delete(':id/books/:bookId')
  removeBook(@Param('id') id: string, @Param('bookId') bookId: string): Author {
    return this.authorsService.unlinkRelatedEntity(id, bookId);
  }
}
