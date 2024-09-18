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
  async create(@Body() createDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateAuthorDto): Promise<Author> {
    return this.authorsService.update(id, updateDto);
  }

  @Post(':id/books/:bookId')
  async addBook(@Param('id') id: string, @Param('bookId') bookId: string): Promise<Author> {
    return this.authorsService.addRelatedEntity(id, bookId);
  }

  @Delete(':id/books/:bookId')
  async removeBook(@Param('id') id: string, @Param('bookId') bookId: string): Promise<Author> {
    return this.authorsService.removeRelatedEntity(id, bookId);
  }
}
