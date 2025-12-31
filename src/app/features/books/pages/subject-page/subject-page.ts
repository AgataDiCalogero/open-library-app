import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, switchMap } from 'rxjs';

import { BooksRepository } from '../../data/books-repository';
import { Book } from '../../../../shared/models/book';
import { SearchBar } from '../../components/search-bar/search-bar';
import { BookList } from '../../components/book-list/book-list';

@Component({
  selector: 'app-subject-page',
  imports: [AsyncPipe, SearchBar, BookList],
  templateUrl: './subject-page.html',
  styleUrl: './subject-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubjectPage {
  private readonly repo = inject(BooksRepository);
  private readonly router = inject(Router);

  subject = input.required<string>();

  books$ = toObservable(this.subject).pipe(
    distinctUntilChanged(),
    switchMap((subject) => this.repo.getSubjectBooks(subject))
  );

  onSearch(subject: string): void {
    this.router.navigate(['/subjects', subject]);
  }

  onOpenBook(book: Book): void {
    this.router.navigate(['/works', book.id], {
      queryParams: { subject: this.subject() },
    });
  }
}
