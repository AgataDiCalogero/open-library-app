import { Injectable, inject } from '@angular/core';
import { catchError, shareReplay, tap, Observable, throwError } from 'rxjs';

import { OpenLibraryApi, SubjectBooksResult } from '../../../core/api/open-library.api';
import { WorkDetail } from '../../../shared/models/work-detail';

@Injectable({
  providedIn: 'root',
})
export class BooksRepository {
  private readonly api = inject(OpenLibraryApi);

  private readonly subjectCache = new Map<string, Observable<SubjectBooksResult>>();

  private readonly workCache = new Map<string, Observable<WorkDetail>>();

  private readonly workSummary = new Map<string, { title: string; authors: string }>();

  getSubjectBooksPage(subject: string, limit: number, offset: number): Observable<SubjectBooksResult> {
    const normalized = subject.trim().toLowerCase();
    const key = `${normalized}|${limit}|${offset}`;

    const cached$ = this.subjectCache.get(key);
    if (cached$) {
      return cached$;
    }

    const req$ = this.api.getBooksBySubject(normalized, { limit, offset }).pipe(
      tap((result) => {
        for (const book of result.books) {
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
