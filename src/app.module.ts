import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';

@Module({
  imports: [BooksModule, AuthorsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}