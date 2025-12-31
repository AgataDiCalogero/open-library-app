import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Book } from '../../../../shared/models/book';
import { BooksRepository } from '../../data/books-repository';
import { SubjectPage } from './subject-page';

describe('SubjectPage', () => {
  it('shows the empty state when no books are found', async () => {
    const repoMock = {
      getSubjectBooksPage: vi.fn().mockReturnValue(
        of({ books: [], total: 0, offset: 0, limit: 24 })
      ),
    } as unknown as BooksRepository;

    await TestBed.configureTestingModule({
      imports: [SubjectPage],
      providers: [
        { provide: BooksRepository, useValue: repoMock },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SubjectPage);
    fixture.componentRef.setInput('subject', 'fantasy');
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No books found');
  });

  it('renders book titles when results are available', async () => {
    const bookMock: Book = {
      id: 'OL1W',
      title: 'The Hobbit',
      authors: 'J.R.R. Tolkien',
      coverId: 123,
    };

    const repoMock = {
      getSubjectBooksPage: vi.fn().mockReturnValue(
        of({ books: [bookMock], total: 1, offset: 0, limit: 24 })
      ),
    } as unknown as BooksRepository;

    await TestBed.configureTestingModule({
      imports: [SubjectPage],
      providers: [
        { provide: BooksRepository, useValue: repoMock },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SubjectPage);
    fixture.componentRef.setInput('subject', 'fantasy');
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('The Hobbit');
  });

  it('accumulates results on load more and keeps the button visible', async () => {
    const bookA: Book = { id: 'A', title: 'Book A', authors: 'A' };
    const bookB: Book = { id: 'B', title: 'Book B', authors: 'B' };
    const bookC: Book = { id: 'C', title: 'Book C', authors: 'C' };
    const bookD: Book = { id: 'D', title: 'Book D', authors: 'D' };

    const getSubjectBooksPage = vi.fn().mockImplementation(
      (_subject: string, limit: number, offset: number) =>
        of({
          books: offset === 0 ? [bookA, bookB] : [bookC, bookD],
          total: 5,
          offset,
          limit,
        })
    );

    const repoMock = {
      getSubjectBooksPage,
    } as unknown as BooksRepository;

    await TestBed.configureTestingModule({
      imports: [SubjectPage],
      providers: [
        { provide: BooksRepository, useValue: repoMock },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SubjectPage);
    const component = fixture.componentInstance;
    (component as { limit: number }).limit = 2;

    fixture.componentRef.setInput('subject', 'fantasy');
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.booksAccumulated().map((book) => book.title)).toEqual(['Book A', 'Book B']);

    component.loadMore();
    fixture.detectChanges();

    expect(component.booksAccumulated().map((book) => book.title)).toEqual([
      'Book A',
      'Book B',
      'Book C',
      'Book D',
    ]);
    expect(fixture.nativeElement.textContent).toContain('Load more');
  });
});
