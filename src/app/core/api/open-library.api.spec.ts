import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { OpenLibraryApi } from './open-library.api';

describe('OpenLibraryApi', () => {
  let api: OpenLibraryApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), OpenLibraryApi],
    });

    api = TestBed.inject(OpenLibraryApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps subject response to books with normalized id and coverId', async () => {
    const resultPromise = firstValueFrom(api.getBooksBySubject('fantasy'));

    const req = httpMock.expectOne(`${environment.openLibraryBaseUrl}/subjects/fantasy.json`);
    expect(req.request.method).toBe('GET');

    const mockDto: SubjectResponseDto = {
      work_count: 120,
      works: [
        {
          key: '/works/OL123W',
          title: 'The Hobbit',
          authors: [{ name: 'J.R.R. Tolkien' }],
          cover_id: 123,
        },
      ],
    };

    req.flush(mockDto);

    const result = await resultPromise;

    expect(result.books).toEqual([
      {
        id: 'OL123W',
        title: 'The Hobbit',
        authors: 'J.R.R. Tolkien',
        coverId: 123,
      },
    ]);
    expect(result.total).toBe(120);
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(1);
  });

  it('passes limit and offset as query params and reads work_count', async () => {
    const resultPromise = firstValueFrom(
      api.getBooksBySubject('fantasy', { limit: 24, offset: 24 })
    );

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.openLibraryBaseUrl}/subjects/fantasy.json` &&
        request.params.get('limit') === '24' &&
        request.params.get('offset') === '24'
    );
    expect(req.request.method).toBe('GET');

    const mockDto: SubjectResponseDto = {
      work_count: 320,
      works: [],
    };

    req.flush(mockDto);

    const result = await resultPromise;
    expect(result.total).toBe(320);
    expect(result.limit).toBe(24);
    expect(result.offset).toBe(24);
  });
});
