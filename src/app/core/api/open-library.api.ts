import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Book } from '../../shared/models/book';
import { Observable, of } from 'rxjs';
import { WorkDetail } from '../../shared/models/work-detail';
import { WorkDetailDto } from './dto/work-detail.dto';
import { WorkEditionDto, WorkEditionsResponseDto } from './dto/work-editions.dto';

export interface SubjectBooksResult {
  books: Book[];
  total: number;
  offset: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class OpenLibraryApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.openLibraryBaseUrl;
  private readonly ignoredSubjectPatterns = [
    /protected daisy/i,
    /internet archive/i,
    /accessible book/i,
    /in library/i,
    /lending library/i,
    /overdrive/i,
  ];

  getBooksBySubject(
    subject: string,
    options: { limit?: number; offset?: number } = {}
  ): Observable<SubjectBooksResult> {
    const encoded = encodeURIComponent(subject);
    const url = `${this.baseUrl}/subjects/${encoded}.json`;

    let params = new HttpParams();
    if (options.limit !== undefined) {
      params = params.set('limit', String(options.limit));
    }
    if (options.offset !== undefined) {
      params = params.set('offset', String(options.offset));
    }

    return this.http.get<SubjectResponseDto>(url, { params }).pipe(
      map((dto) => {
        const books = dto.works.map((work) => ({
          id: work.key.split('/').pop() ?? work.key,
          title: work.title,
          authors: (work.authors ?? []).map((author) => author.name).join(', ') || 'Unknown',
          coverId: work.cover_id,
        }));
        return {
          books,
          total: dto.work_count,
          offset: options.offset ?? 0,
          limit: options.limit ?? books.length,
        };
      })
    );
  }

  getWorkDetail(workId: string): Observable<WorkDetail> {
    const encoded = encodeURIComponent(workId);
    const url = `${this.baseUrl}/works/${encoded}.json`;
    return this.http.get<WorkDetailDto>(url).pipe(
      map((dto) => {
        const rawDescription =
          typeof dto.description === 'string'
            ? dto.description
            : (dto.description?.value ?? 'No description available');
        const description = this.sanitizeDescription(rawDescription);
        const coverId = dto.covers?.find((value) => value > 0);
        const idSource = dto.key?.trim() || workId;
        const normalizedId = idSource.split('/').pop() ?? idSource;
        const openLibraryKey = idSource.startsWith('/works/')
          ? idSource
          : `/works/${normalizedId}`;

        return {
          id: normalizedId,
          title: dto.title,
          description,
          coverId,
          publishYear: this.extractPublishYear(dto),
          languages: this.extractLanguages(dto.languages),
          subjects: this.extractSubjects(dto.subjects),
          pages: this.extractPages(dto),
          openLibraryUrl: `https://openlibrary.org${openLibraryKey}`,
        };
      }),
      switchMap((workDetail) => {
        const needsEdition = !workDetail.languages?.length || !workDetail.pages;
        if (!needsEdition) {
          return of(workDetail);
        }

        return this.getWorkEditionSnapshot(workDetail.id).pipe(
          map((entries) => {
            if (!entries.length) {
              return workDetail;
            }
            const editionForPages = entries.find(
              (entry) =>
                entry.number_of_pages !== undefined ||
                this.parsePagination(entry.pagination) !== undefined
            );
            const editionForLanguages = entries.find((entry) => entry.languages?.length);
            const editionLanguages = this.extractLanguages(editionForLanguages?.languages);
            const editionPages = this.extractEditionPages(editionForPages);
            return {
              ...workDetail,
              languages: workDetail.languages ?? editionLanguages,
              pages: workDetail.pages ?? editionPages,
            };
          }),
          catchError(() => of(workDetail))
        );
      })
    );
  }

  private sanitizeDescription(raw: string): string {
    let text = raw.replaceAll(/<[^>]*>/g, '');
    text = text.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
    text = text.replaceAll(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replaceAll(/([*_])(.*?)\1/g, '$2');
    text = text.replaceAll(/`+/g, '');
    text = text.replaceAll(/[ \t]+/g, ' ');
    text = text.replaceAll(/\n{3,}/g, '\n\n');
    return text.trim();
  }

  private extractPublishYear(dto: WorkDetailDto): number | undefined {
    const candidates = [dto.first_publish_date, dto.created?.value, dto.type?.key];
    for (const candidate of candidates) {
      const year = this.parseYear(candidate);
      if (year !== undefined) {
        return year;
      }
    }
    return undefined;
  }

  private parseYear(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }
    const match = value.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
    return match ? Number(match[0]) : undefined;
  }

  private extractLanguages(languages?: { key: string }[]): string[] | undefined {
    if (!languages?.length) {
      return undefined;
    }
    const mapped = languages
      .map((language) => language.key.split('/').pop()?.trim())
      .filter((code): code is string => Boolean(code));
    return mapped.length ? mapped : undefined;
  }

  private extractSubjects(subjects?: string[]): string[] | undefined {
    if (!subjects?.length) {
      return undefined;
    }
    const filtered: string[] = [];
    for (const subject of subjects) {
      const cleaned = subject.trim();
      if (!cleaned) {
        continue;
      }
      if (this.ignoredSubjectPatterns.some((pattern) => pattern.test(cleaned))) {
        continue;
      }
      if (!filtered.includes(cleaned)) {
        filtered.push(cleaned);
      }
      if (filtered.length >= 10) {
        break;
      }
    }
    return filtered.length ? filtered : undefined;
  }

  private extractPages(dto: WorkDetailDto): number | undefined {
    const pages = dto.number_of_pages ?? dto.pages;
    return typeof pages === 'number' && pages > 0 ? pages : undefined;
  }

  private getWorkEditionSnapshot(workId: string): Observable<WorkEditionDto[]> {
    const encoded = encodeURIComponent(workId);
    const url = `${this.baseUrl}/works/${encoded}/editions.json`;
    const params = new HttpParams().set('limit', '50');

    return this.http.get<WorkEditionsResponseDto>(url, { params }).pipe(
      map((dto) => dto.entries ?? [])
    );
  }

  private extractEditionPages(edition?: WorkEditionDto): number | undefined {
    if (!edition) {
      return undefined;
    }
    const pages = edition.number_of_pages ?? this.parsePagination(edition.pagination);
    return typeof pages === 'number' && pages > 0 ? pages : undefined;
  }

  private parsePagination(pagination?: string): number | undefined {
    if (!pagination) {
      return undefined;
    }
    const match = pagination.match(/\d+/);
    return match ? Number(match[0]) : undefined;
  }
}
