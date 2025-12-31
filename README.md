# Open Library App

Progetto portfolio Start2Impact: app Angular per esplorare libri di Open Library per subject, con paginazione manuale e pagina dettaglio opera.

![Screenshot](./docs/screenshot-subject.png)

Vai a: [Italiano](#open-library-app) · [English](#english-version)

## Live Demo & Repository

- Live Demo: In arrivo (deploy in corso)
- Repo: https://github.com/AgataDiCalogero/open-library-app

## Features

- Browse by subject con search bar e chips "Popular subjects"
- Lista libri con cover da Open Library
- Pagina dettaglio opera con back deterministico tramite query `subject`
- Caching in-memory con repository pattern
- Loading state ed empty state
- Paginazione con `limit/offset` e bottone "Load more"

## Tech Stack

- Angular 21 standalone, Signals, Router input binding
- HttpClient con interceptor per error handling
- Tailwind CSS con theme tokens (`--color-brand`, `--color-paper`, `--color-ink`, `--color-wash`)
- Vitest + Angular TestBed, coverage via V8

## API

- Open Library Subjects API: https://openlibrary.org/dev/docs/api/subjects
- Supporto `limit`, `offset` e `work_count` per il totale risultati
- Work detail via endpoint `/works/:id.json`

## Project Structure

- `src/app/core/` - API client, DTO, error handling
- `src/app/features/` - feature "books" con components, data, pages
- `src/app/shared/` - modelli condivisi
- `src/environments/` - config ambienti
- `src/styles.css` - theme tokens Tailwind

## Architettura (perche cosi)

- `core/api` centralizza le chiamate e il mapping DTO -> domain per tenere pulite le pagine.
- `BooksRepository` gestisce cache in-memory e `shareReplay(1)` per evitare richieste duplicate.
- `features/books/pages` orchestrano lo stato (Signals) e la navigazione.
- `features/books/components` sono presentational, riusabili e senza logica di fetch.
- Router input binding semplifica il passaggio di parametri e query param alle pagine.
- La paginazione manuale limita le richieste cover e mantiene UX controllata.

## Scripts / Commands

```bash
npm i
npm start
npm run lint
npm run format
ng test --coverage
```

`ng test --coverage` genera la cartella `coverage/`.

## Testing

- `src/app/app.spec.ts` - bootstrap dell'app
- `src/app/core/api/open-library.api.spec.ts` - mapping API + query params `limit/offset`
- `src/app/features/books/data/books-repository.spec.ts` - cache per subject/limit/offset
- `src/app/features/books/pages/subject-page/subject-page.spec.ts` - empty state, render lista, load more

Coverage:

- `ng test --coverage`

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `dist/open-library-app`

SPA rewrite (in `_redirects` o `netlify.toml`):

```text
/* /index.html 200
```

## Known limitations

- Deep link su `/works/:id` senza `?subject` puo perdere la summary autori; la UI mostra fallback.

## Roadmap / Next steps

- Ordinamento risultati (per titolo o autore)
- Skeleton piu ricchi e coerenti con la griglia
- Miglioramenti ARIA e focus states
- Salvataggio preferiti in local storage

## English Version

# Open Library App

Portfolio project for Start2Impact: an Angular app to explore Open Library books by subject, with manual pagination and a work detail page.

![Screenshot](./docs/screenshot-subject.png)

## Live Demo & Repository

- Live Demo: Coming soon (deployment in progress)
- Repo: https://github.com/AgataDiCalogero/open-library-app

## Features

- Browse by subject with search bar and “Popular subjects” chips
- Book list with Open Library covers
- Work detail page with deterministic back navigation via `subject` query param
- In-memory caching using a repository pattern
- Loading and empty states
- Pagination using `limit/offset` with a manual “Load more” button

## Tech Stack

- Angular 21 standalone, Signals, Router input binding
- HttpClient with interceptor for error handling
- Tailwind CSS with theme tokens (`--color-brand`, `--color-paper`, `--color-ink`, `--color-wash`)
- Vitest + Angular TestBed, coverage via V8

## API

- Open Library Subjects API: https://openlibrary.org/dev/docs/api/subjects
- Supports `limit`, `offset`, and `work_count` for total results
- Work detail via `/works/:id.json`

## Project Structure

- `src/app/core/` - API client, DTOs, error handling
- `src/app/features/` - “books” feature with components, data, pages
- `src/app/shared/` - shared models
- `src/environments/` - environment config
- `src/styles.css` - Tailwind theme tokens

## Architecture (why this way)

- `core/api` centralizes HTTP calls and DTO -> domain mapping to keep pages clean.
- `BooksRepository` manages in-memory cache and `shareReplay(1)` to avoid duplicate requests.
- `features/books/pages` orchestrate state (Signals) and navigation.
- `features/books/components` are presentational and reusable, without fetch logic.
- Router input binding simplifies passing params and query params into pages.
- Manual pagination limits cover requests and keeps UX controlled.

## Scripts / Commands

```bash
npm i
npm start
npm run lint
npm run format
ng test --coverage
```

`ng test --coverage` generates the `coverage/` folder.

## Testing

- `src/app/app.spec.ts` - app bootstrap
- `src/app/core/api/open-library.api.spec.ts` - API mapping + `limit/offset` query params
- `src/app/features/books/data/books-repository.spec.ts` - cache by subject/limit/offset
- `src/app/features/books/pages/subject-page/subject-page.spec.ts` - empty state, list render, load more

Coverage:

- `ng test --coverage`

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `dist/open-library-app`

SPA rewrite (in `_redirects` or `netlify.toml`):

```text
/* /index.html 200
```

## Known limitations

- Deep link to `/works/:id` without `?subject` may miss the author summary; the UI falls back.

## Roadmap / Next steps

- Sorting (title/author)
- Richer skeletons aligned with the grid
- ARIA and focus improvements
- Favorites saved in local storage
