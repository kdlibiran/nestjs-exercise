import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { IAuthor } from 'src/types/data.interface';
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
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<IAuthor> {
    try {
      return this.authorsService.create(createAuthorDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @ApiOperation({ summary: 'Get all authors' })
  @ApiResponse({ status: 200, description: 'The authors have been successfully retrieved.' })
  @Get()
  async findAll(): Promise<IAuthor[]> {
    return this.authorsService.findAll();
  }

  @ApiOperation({ summary: 'Get an author by ID' })
  @ApiResponse({ status: 200, description: 'The author has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IAuthor> {
    return this.authorsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an author by ID' })
  @ApiResponse({ status: 200, description: 'The author has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto): Promise<IAuthor> {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @ApiOperation({ summary: 'Delete an author by ID' })
  @ApiResponse({ status: 200, description: 'The author has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{message: string}> {
    return this.authorsService.remove(id);
  }

  @ApiOperation({ summary: 'Add a book to an author by ID' })
  @ApiResponse({ status: 200, description: 'The book has been successfully added to the author.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @ApiParam({ name: 'bookId', type: String, description: 'The ID of the book', example: '43d9e0f4-bd52-4641-8e70-3b874e123e79' })
  @Post(':id/books/:bookId')
  async addBook(@Param('id') id: string, @Param('bookId') bookId: string): Promise<IAuthor> {
    return this.authorsService.addRelatedEntity(id, bookId);
  }

  @ApiOperation({ summary: 'Remove a book from an author by ID' })
  @ApiResponse({ status: 200, description: 'The book has been successfully removed from the author.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the author', example: 'dc8bff4b-33f2-41d5-bf60-6b9bb66b8474' })
  @ApiParam({ name: 'bookId', type: String, description: 'The ID of the book', example: '43d9e0f4-bd52-4641-8e70-3b874e123e79' })
  @Delete(':id/books/:bookId')
  async removeBook(@Param('id') id: string, @Param('bookId') bookId: string): Promise<IAuthor> {
    return this.authorsService.removeRelatedEntity(id, bookId);
  }
}
