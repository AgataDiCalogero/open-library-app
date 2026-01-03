import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { WorkDetailDto } from './dto/work-detail.dto';
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

  it('maps work detail metadata and builds Open Library url', async () => {
    const resultPromise = firstValueFrom(api.getWorkDetail('OL123W'));

    const req = httpMock.expectOne(`${environment.openLibraryBaseUrl}/works/OL123W.json`);
    expect(req.request.method).toBe('GET');

    const mockDto: WorkDetailDto = {
      key: '/works/OL123W',
      title: 'The Hobbit',
      description: { value: 'There and back again.' },
      covers: [0, 123],
      first_publish_date: '1937',
      languages: [{ key: '/languages/eng' }, { key: '/languages/ita' }],
      subjects: ['Fantasy', 'Protected DAISY', 'Adventure'],
      number_of_pages: 310,
    };

    req.flush(mockDto);

    const result = await resultPromise;

    expect(result).toEqual({
      id: 'OL123W',
      title: 'The Hobbit',
      description: 'There and back again.',
      coverId: 123,
      publishYear: 1937,
      languages: ['eng', 'ita'],
      subjects: ['Fantasy', 'Adventure'],
      pages: 310,
      openLibraryUrl: 'https://openlibrary.org/works/OL123W',
    });
  });

  it('falls back to created date when first_publish_date is missing', async () => {
    const resultPromise = firstValueFrom(api.getWorkDetail('OL999W'));

    const req = httpMock.expectOne(`${environment.openLibraryBaseUrl}/works/OL999W.json`);
    expect(req.request.method).toBe('GET');

    const mockDto: WorkDetailDto = {
      key: '/works/OL999W',
      title: 'Sample Work',
      description: 'A short description.',
      created: { value: '2001-01-05T00:00:00.000Z' },
    };

    req.flush(mockDto);

    const editionsReq = httpMock.expectOne(
      (request) =>
        request.url === `${environment.openLibraryBaseUrl}/works/OL999W/editions.json` &&
        request.params.get('limit') === '50'
    );
    editionsReq.flush({ entries: [] });

    const result = await resultPromise;

    expect(result.publishYear).toBe(2001);
    expect(result.openLibraryUrl).toBe('https://openlibrary.org/works/OL999W');
  });

  it('uses edition metadata when work is missing languages or pages', async () => {
    const resultPromise = firstValueFrom(api.getWorkDetail('OL555W'));

    const workReq = httpMock.expectOne(`${environment.openLibraryBaseUrl}/works/OL555W.json`);
    expect(workReq.request.method).toBe('GET');

    const mockWorkDto: WorkDetailDto = {
      key: '/works/OL555W',
      title: 'Edition Fallback',
      description: 'Edition-backed metadata.',
    };

    workReq.flush(mockWorkDto);

    const editionsReq = httpMock.expectOne(
      (request) =>
        request.url === `${environment.openLibraryBaseUrl}/works/OL555W/editions.json` &&
        request.params.get('limit') === '50'
    );
    editionsReq.flush({
      entries: [
        {
          languages: [{ key: '/languages/eng' }],
          number_of_pages: 140,
        },
      ],
    });

    const result = await resultPromise;

    expect(result.languages).toEqual(['eng']);
    expect(result.pages).toBe(140);
  });
});
