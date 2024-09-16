import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { IAuthor, IBook } from 'src/types/data.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @ApiOperation({ summary: 'Create an author' })
  @ApiResponse({ status: 201, description: 'The author has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto): IAuthor {
    try {
      return this.authorsService.create(createAuthorDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Get all authors' })
  @ApiResponse({ status: 200, description: 'The authors have been successfully retrieved.' })
  @Get()
  findAll(): IAuthor[] {
    return this.authorsService.findAll();
  }

  @ApiOperation({ summary: 'Get an author by ID' })
  @ApiResponse({ status: 200, description: 'The author has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Get(':id')
  findOne(@Param('id') id: string): IAuthor {
    try {
      return this.authorsService.findOne(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Update an author by ID' })
  @ApiResponse({ status: 200, description: 'The author has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto): IAuthor {
    try {
      return this.authorsService.update(id, updateAuthorDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Delete an author by ID' })
  @ApiResponse({ status: 200, description: 'The author has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Delete(':id')
  remove(@Param('id') id: string): {message: string} {
    try {
      return this.authorsService.remove(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Get books by author ID' })
  @ApiResponse({ status: 200, description: 'The books have been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Get(':id/books')
  getBooks(@Param('id') id: string): IBook[] {
    try {
      return this.authorsService.findBooks(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
