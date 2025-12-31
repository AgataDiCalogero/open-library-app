import { ChangeDetectionStrategy, Component, effect, input, output, signal, untracked } from '@angular/core';
import { Field, form } from '@angular/forms/signals';

@Component({
  selector: 'app-search-bar',
  imports: [Field],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBar {
  value = input<string>('');
  searched = output<string>();

  private readonly formModel = signal({ subject: '' });
  readonly searchForm = form(this.formModel);
  readonly subjectField = this.searchForm.subject;

  constructor() {
    effect(() => {
      const incoming = this.value() ?? '';
      const current = untracked(() => this.subjectField().value());
      if (incoming !== current) {
        this.subjectField().value.set(incoming);
      }
    });
  }

  submit(): void {
    const normalized = this.normalize(this.subjectField().value());
    if (normalized) {
      this.searched.emit(normalized);
    }
  }

  private normalize(v: string): string {
    return v
      .trim()
      .toLowerCase()
      .replace(/([\s-]+)/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
