import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Author, Book } from '../types/data.interface';
import { AbstractController } from 'src/abstract/abstract.controller';

@Controller('books')
export class BooksController extends AbstractController<Book, Author> {
  constructor(private readonly booksService: BooksService) {
    super(booksService);
  }

  @Post()
  create(@Body() createDto: CreateBookDto): Book {
    return this.booksService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateBookDto): Book {
    return this.booksService.update(id, updateDto);
  }

  @Post(':id/authors/:authorId')
  addAuthor(@Param('id') id: string, @Param('authorId') authorId: string): Book {
    return this.booksService.addRelatedEntity(id, authorId);
  }

  @Delete(':id/authors/:authorId')
  removeAuthor(@Param('id') id: string, @Param('authorId') authorId: string): Book {
    return this.booksService.removeRelatedEntity(id, authorId);
  }
}
