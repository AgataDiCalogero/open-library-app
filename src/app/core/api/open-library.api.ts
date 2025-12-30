import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { map } from 'rxjs/operators';
import { Book } from '../../shared/models/book';
import { Observable } from 'rxjs';

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
}
