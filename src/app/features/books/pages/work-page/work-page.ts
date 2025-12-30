import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BookDetail } from '../../components/book-detail/book-detail';

@Component({
  selector: 'app-work-page',
  imports: [BookDetail],
  templateUrl: './work-page.html',
  styleUrl: './work-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkPage {}
