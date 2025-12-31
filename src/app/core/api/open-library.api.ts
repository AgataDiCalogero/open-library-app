import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { map } from 'rxjs/operators';
import { Book } from '../../shared/models/book';
import { Observable } from 'rxjs';
import { WorkDetail } from '../../shared/models/work-detail';
import { WorkDetailDto } from './dto/work-detail.dto';

@Injectable({
  providedIn: 'root',
})
export class OpenLibraryApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.openLibraryBaseUrl;

  getBooksBySubject(subject: string): Observable<Book[]> {
    const encoded = encodeURIComponent(subject);
    const url = `${this.baseUrl}/subjects/${encoded}.json`;

    return this.http.get<SubjectResponseDto>(url).pipe(
      map((dto) =>
        dto.works.map((work) => ({
          id: work.key.split('/').pop() ?? work.key,
          title: work.title,
          authors: (work.authors ?? []).map((author) => author.name).join(', ') || 'Unknown',
        }))
      )
    );
  }

  getWorkDetail(workId: string): Observable<WorkDetail> {
    const encoded = encodeURIComponent(workId);
    const url = `${this.baseUrl}/works/${encoded}.json`;
    return this.http.get<WorkDetailDto>(url).pipe(
      map((dto) => {
        const description =
          typeof dto.description === 'string'
            ? dto.description
            : dto.description?.value ?? 'No description available';
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
}
