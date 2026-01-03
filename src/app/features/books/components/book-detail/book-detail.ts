import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { WorkDetail } from '../../../../shared/models/work-detail';
import { Icon } from '../../../../shared/components/icon/icon';
import { formatLanguageCodes } from '../../../../shared/utils/language-utils';
import { normalizeSubjectLabel } from '../../../../shared/utils/subject-utils';

@Component({
  selector: 'app-book-detail',
  imports: [Icon],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetail {
  work = input.required<WorkDetail>();

  summary = input<{ title: string; authors: string } | undefined>();

  back = output<void>();

  private readonly subjectLimit = 6;
  readonly showAllSubjects = signal(false);

  private readonly normalizedSubjects = computed(() => {
    const subjects = this.work().subjects ?? [];
    const normalized: string[] = [];
    const seen = new Set<string>();
    for (const subject of subjects) {
      const label = normalizeSubjectLabel(subject);
      if (!label || seen.has(label)) {
        continue;
      }
      seen.add(label);
      normalized.push(label);
    }
    return normalized;
  });

  metaEntries = computed(() => {
    const work = this.work();
    const languageLabel = formatLanguageCodes(work.languages);
    return [
      { label: 'Published', value: work.publishYear?.toString() ?? '–' },
      { label: 'Language', value: languageLabel ?? '–' },
      { label: 'Pages', value: work.pages?.toString() ?? '–' },
    ];
  });

  subjectChips = computed(() => {
    const subjects = this.normalizedSubjects();
    const limit = this.showAllSubjects() ? subjects.length : this.subjectLimit;
    const visible = subjects.slice(0, limit);
    return {
      visible,
      hiddenCount: Math.max(subjects.length - visible.length, 0),
      canToggle: subjects.length > this.subjectLimit,
      expanded: this.showAllSubjects(),
    };
  });

  coverUrl = computed(() => {
    const id = this.work().coverId;
    return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg?default=false` : null;
  });

  private readonly resetSubjectsEffect = effect(() => {
    this.work();
    this.showAllSubjects.set(false);
  });

  toggleSubjects(): void {
    this.showAllSubjects.update((value) => !value);
  }
}
