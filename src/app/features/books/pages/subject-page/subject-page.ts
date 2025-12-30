import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SearchBar } from '../../components/search-bar/search-bar';
import { BookList } from '../../components/book-list/book-list';

@Component({
  selector: 'app-subject-page',
  imports: [SearchBar, BookList],
  templateUrl: './subject-page.html',
  styleUrl: './subject-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubjectPage {}
