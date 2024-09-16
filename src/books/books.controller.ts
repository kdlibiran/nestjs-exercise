import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { IAuthor, IBook } from '../types/data.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({ summary: 'Create a book' })
  @ApiResponse({ status: 201, description: 'The book has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post()
  create(@Body() createBookDto: CreateBookDto): IBook {
    try {
      return this.booksService.create(createBookDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'The books have been successfully retrieved.' })
  @Get()
  findAll(): IBook[] {
    return this.booksService.findAll();
  }

  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiResponse({ status: 200, description: 'The book has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the book', example: '43d9e0f4-bd52-4641-8e70-3b874e123e79' })
  @Get(':id')
  findOne(@Param('id') id: string): IBook {
    try {
      return this.booksService.findOne(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiResponse({ status: 200, description: 'The book has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the book', example: '43d9e0f4-bd52-4641-8e70-3b874e123e79' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto): IBook {
    try {
      return this.booksService.update(id, updateBookDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiResponse({ status: 200, description: 'The book has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the book', example: '43d9e0f4-bd52-4641-8e70-3b874e123e79' })
  @Delete(':id')
  remove(@Param('id') id: string): {message: string} {
    try {
      return this.booksService.remove(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Get authors by book ID' })
  @ApiResponse({ status: 200, description: 'The authors have been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the book', example: '43d9e0f4-bd52-4641-8e70-3b874e123e79' })
  @Get(':id/authors')
  getAuthors(@Param('id') id: string): IAuthor[] {
    try {
      return this.booksService.findAuthors(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Add an author to a book by ID' })
  @ApiResponse({ status: 200, description: 'The author has been successfully added to the book.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the book', example: '43d9e0f4-bd52-4641-8e70-3b874e123e79' })
  @ApiParam({ name: 'authorId', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Post(':id/authors/:authorId')
  addAuthor(@Param('id') id: string, @Param('authorId') authorId: string): IBook {
    try {
      return this.booksService.addAuthorToBook(id, authorId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Remove an author from a book by ID' })
  @ApiResponse({ status: 200, description: 'The author has been successfully removed from the book.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the book', example: '43d9e0f4-bd52-4641-8e70-3b874e123e79' })
  @ApiParam({ name: 'authorId', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Delete(':id/authors/:authorId')
  removeAuthor(@Param('id') id: string, @Param('authorId') authorId: string): IBook {
    try {
      return this.booksService.removeAuthorFromBook(id, authorId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
