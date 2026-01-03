import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Book } from '../../../../shared/models/book';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCard {
  book = input.required<Book>();
  selectBook = output<Book>();

  authorsText = computed(() => {
    const raw = this.book().authors;
    if (!raw) return 'Unknown';
    const parts = raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  });

  coverUrl = computed(() => {
    const id = this.book().coverId;
    return id ? `https://covers.openlibrary.org/b/id/${id}-M.jpg` : null;
  });

  onCardClick(): void {
    this.selectBook.emit(this.book());
  }
}
