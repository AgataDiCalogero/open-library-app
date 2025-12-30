import { Routes } from '@angular/router';
import { SubjectPage } from './features/books/pages/subject-page/subject-page';
import { WorkPage } from './features/books/pages/work-page/work-page';

export const routes: Routes = [
  { path: '', redirectTo: 'subjects/fantasy', pathMatch: 'full' },
  { path: 'subjects/:subject', component: SubjectPage },
  { path: 'works/:workId', component: WorkPage },
  { path: '**', redirectTo: 'subjects/fantasy' },
];
