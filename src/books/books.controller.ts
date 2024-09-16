import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { IAuthor, IBook } from '../types/data.interface';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto): IBook {
    try {
      return this.booksService.create(createBookDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get()
  findAll(): IBook[] {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): IBook {
    try {
      return this.booksService.findOne(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto): IBook {
    try {
      return this.booksService.update(id, updateBookDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string): {message: string} {
    try {
      return this.booksService.remove(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get(':id/authors')
  getAuthors(@Param('id') id: string): IAuthor[] {
    try {
      return this.booksService.findAuthors(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post(':id/authors/:authorId')
  addAuthor(@Param('id') id: string, @Param('authorId') authorId: string): IBook {
    try {
      return this.booksService.addAuthorToBook(id, authorId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id/authors/:authorId')
  removeAuthor(@Param('id') id: string, @Param('authorId') authorId: string): IBook {
    try {
      return this.booksService.removeAuthorFromBook(id, authorId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
