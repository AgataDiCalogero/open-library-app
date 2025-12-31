import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Book } from '../../../../shared/models/book';
import { BookCard } from '../book-card/book-card';

@Component({
  selector: 'app-book-list',
  imports: [BookCard],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookList {
  books = input.required<Book[]>();

  selectBook = output<Book>();
}
