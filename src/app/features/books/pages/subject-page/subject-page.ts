import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { BooksRepository } from '../../data/books-repository';
import { Book } from '../../../../shared/models/book';
import { SearchBar } from '../../components/search-bar/search-bar';
import { BookList } from '../../components/book-list/book-list';
import { normalizeSubjectLabel } from '../../../../shared/utils/subject-utils';

@Component({
  selector: 'app-subject-page',
  imports: [SearchBar, BookList],
  templateUrl: './subject-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubjectPage {
  private readonly repo = inject(BooksRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly limit = 24;
  readonly offset = signal(0);
  readonly booksAccumulated = signal<Book[]>([]);
  readonly total = signal<number | null>(null);
  readonly isInitialLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly searchResetToken = signal(0);

  readonly popularSubjects = [
    'fantasy',
    'romance',
    'science_fiction',
    'history',
    'horror',
    'poetry',
    'children',
    'mystery',
    'biography',
    'travel',
  ];

  readonly canLoadMore = computed(() => {
    const total = this.total();
    return total !== null && this.booksAccumulated().length < total;
  });

  subject = input.required<string>();

  constructor() {
    effect(() => {
      const subject = this.subject();
      untracked(() => {
        this.offset.set(0);
        this.booksAccumulated.set([]);
        this.total.set(null);
        this.isLoadingMore.set(false);
      });

      if (!subject) {
        this.isInitialLoading.set(false);
        return;
      }

      this.fetchPage(subject, 0, false);
    });
  }

  onSearchFromInput(subject: string): void {
    this.router.navigate(['/subjects', subject]);
  }

  onSearchFromChip(subject: string): void {
    this.searchResetToken.update((value) => value + 1);
    this.router.navigate(['/subjects', subject]);
  }

  onOpenBook(book: Book): void {
    this.router.navigate(['/works', book.id], {
      queryParams: { subject: this.subject() },
    });
  }

  loadMore(): void {
    if (!this.canLoadMore() || this.isLoadingMore() || this.isInitialLoading()) {
      return;
    }
    const nextOffset = this.offset() + this.limit;
    this.fetchPage(this.subject(), nextOffset, true);
  }

  formatSubjectLabel(subject: string): string {
    return normalizeSubjectLabel(subject);
  }

  private fetchPage(subject: string, offset: number, append: boolean): void {
    const loadingSignal = append ? this.isLoadingMore : this.isInitialLoading;
    loadingSignal.set(true);

    this.repo
      .getSubjectBooksPage(subject, this.limit, offset)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => loadingSignal.set(false))
      )
      .subscribe({
        next: (result) => {
          this.total.set(result.total);
          this.offset.set(offset);
          if (append) {
            this.booksAccumulated.update((current) => [...current, ...result.books]);
          } else {
            this.booksAccumulated.set(result.books);
          }
        },
      });
  }
}
