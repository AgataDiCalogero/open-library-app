import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { BookDetail } from '../../components/book-detail/book-detail';
import { BooksRepository } from '../../data/books-repository';
import { WorkDetail } from '../../../../shared/models/work-detail';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-work-page',
  imports: [BookDetail, AsyncPipe],
  templateUrl: './work-page.html',
  styleUrl: './work-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkPage {
  private readonly repo = inject(BooksRepository);
  private readonly router = inject(Router);

  workId = input.required<string>();

  subject = input<string>();

  summary = computed(() => this.repo.getWorkSummary(this.workId()));
  workDetail$!: Observable<WorkDetail>;

  private readonly loadEffect = effect(() => {
    this.workDetail$ = this.repo.getWorkDetail(this.workId());
  });

  goBack() {
    const s = this.subject();
    this.router.navigate(['/subjects', s ?? 'fantasy']);
  }
}
