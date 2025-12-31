import { Injectable, inject } from '@angular/core';
import { catchError, shareReplay, tap, Observable, throwError } from 'rxjs';

import { OpenLibraryApi } from '../../../core/api/open-library.api';
import { Book } from '../../../shared/models/book';
import { WorkDetail } from '../../../shared/models/work-detail';

@Injectable({
  providedIn: 'root',
})
export class BooksRepository {
  private readonly api = inject(OpenLibraryApi);

  private readonly subjectCache = new Map<string, Observable<Book[]>>();

  private readonly workCache = new Map<string, Observable<WorkDetail>>();

  private readonly workSummary = new Map<string, { title: string; authors: string }>();

  getSubjectBooks(subject: string): Observable<Book[]> {
    const key = subject.trim().toLowerCase();

    const cached$ = this.subjectCache.get(key);
    if (cached$) {
      return cached$;
    }

    const req$ = this.api.getBooksBySubject(key).pipe(
      tap((books) => {
        for (const book of books) {
          this.workSummary.set(book.id, { title: book.title, authors: book.authors });
        }
      }),

      shareReplay({ bufferSize: 1, refCount: false }),

      catchError((err) => {
        this.subjectCache.delete(key);
        return throwError(() => err);
      })
    );

    this.subjectCache.set(key, req$);
    return req$;
  }

  getWorkDetail(workId: string): Observable<WorkDetail> {
    const id = workId.includes('/') ? workId.split('/').pop() ?? workId : workId;
    const cached$ = this.workCache.get(id);
    if (cached$) {
      return cached$;
    }

    const req$ = this.api.getWorkDetail(id).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError((err) => {
        this.workCache.delete(id);
        return throwError(() => err);
      })
    );

    this.workCache.set(id, req$);
    return req$;
  }

  getWorkSummary(workId: string): { title: string; authors: string } | undefined {
    const id = workId.includes('/') ? workId.split('/').pop() ?? workId : workId;
    return this.workSummary.get(id);
  }
}
