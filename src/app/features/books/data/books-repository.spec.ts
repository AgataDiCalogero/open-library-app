import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';

import { OpenLibraryApi, SubjectBooksResult } from '../../../core/api/open-library.api';
import { Book } from '../../../shared/models/book';
import { BooksRepository } from './books-repository';

describe('BooksRepository', () => {
  it('caches repeated subject requests by subject, limit, and offset', async () => {
    const bookMock: Book = {
      id: 'OL1W',
      title: 'The Hobbit',
      authors: 'J.R.R. Tolkien',
      coverId: 123,
    };
    const secondPageMock: Book = {
      id: 'OL2W',
      title: 'The Silmarillion',
      authors: 'J.R.R. Tolkien',
      coverId: 456,
    };

    const getBooksBySubject = vi.fn().mockImplementation(
      (_subject: string, options?: { limit?: number; offset?: number }) =>
        of({
          books: options?.offset === 24 ? [secondPageMock] : [bookMock],
          total: 5,
          offset: options?.offset ?? 0,
          limit: options?.limit ?? 24,
        } satisfies SubjectBooksResult)
    );
    const apiMock = {
      getBooksBySubject,
    } as unknown as OpenLibraryApi;

    TestBed.configureTestingModule({
      providers: [BooksRepository, { provide: OpenLibraryApi, useValue: apiMock }],
    });

    const repo = TestBed.inject(BooksRepository);

    const first$ = repo.getSubjectBooksPage('fantasy', 24, 0);
    const second$ = repo.getSubjectBooksPage('fantasy', 24, 0);
    const third$ = repo.getSubjectBooksPage('fantasy', 24, 24);

    const [firstResult, secondResult, thirdResult] = await Promise.all([
      firstValueFrom(first$),
      firstValueFrom(second$),
      firstValueFrom(third$),
    ]);

    expect(getBooksBySubject).toHaveBeenCalledTimes(2);
    expect(firstResult).toEqual(secondResult);
    expect(thirdResult.books).toEqual([secondPageMock]);
  });
});
