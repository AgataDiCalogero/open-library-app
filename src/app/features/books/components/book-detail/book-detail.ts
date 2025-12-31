import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { WorkDetail } from '../../../../shared/models/work-detail';

@Component({
  selector: 'app-book-detail',
  imports: [],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetail {
  work = input.required<WorkDetail>();

  summary = input<{ title: string; authors: string } | undefined>();

  back = output<void>();

  coverUrl = computed(() => {
    const id = this.work().coverId;
    return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg?default=false` : null;
  });
}
