import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { map } from 'rxjs/operators';
import { Book } from '../../shared/models/book';
import { Observable } from 'rxjs';
import { WorkDetail } from '../../shared/models/work-detail';
import { WorkDetailDto } from './dto/work-detail.dto';

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

        return {
          id: idSource.split('/').pop() ?? idSource,
          title: dto.title,
          description,
          coverId,
        };
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
}
