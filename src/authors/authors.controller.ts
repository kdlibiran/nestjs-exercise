import { Controller, Post, Param, Delete, Body, Patch } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { IAuthorsWithBooks, IAuthor, IBook } from 'src/types/data.interface';
import { AbstractController } from 'src/abstract/abstract.controller';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Controller('authors')
export class AuthorsController extends AbstractController<IAuthor, IBook, IAuthorsWithBooks> {
  constructor(private readonly authorsService: AuthorsService) {
    super(authorsService);
  }

  @Post()
  async create(@Body() createDto: CreateAuthorDto): Promise<IAuthorsWithBooks> {
    return this.authorsService.create(createDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateAuthorDto): Promise<IAuthorsWithBooks> {
    return this.authorsService.update(id, updateDto);
  }

  @Post(':id/books/:bookId')
  async addBook(@Param('id') id: string, @Param('bookId') bookId: string): Promise<IAuthorsWithBooks> {
    return this.authorsService.addRelatedEntity(id, bookId);
  }

  @Delete(':id/books/:bookId')
  async removeBook(@Param('id') id: string, @Param('bookId') bookId: string): Promise<IAuthorsWithBooks> {
    return this.authorsService.removeRelatedEntity(id, bookId);
  }
}
