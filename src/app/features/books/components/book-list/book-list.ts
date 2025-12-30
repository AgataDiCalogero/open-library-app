import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-book-list',
  imports: [],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookList {}
