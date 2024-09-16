import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { IAuthor } from 'src/types/data.interface';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto): IAuthor {
    try {
      return this.authorsService.create(createAuthorDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get()
  findAll(): IAuthor[] {
    return this.authorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): IAuthor {
    try {
      return this.authorsService.findOne(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto): IAuthor {
    try {
      return this.authorsService.update(id, updateAuthorDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string): {message: string} {
    try {
      return this.authorsService.remove(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
