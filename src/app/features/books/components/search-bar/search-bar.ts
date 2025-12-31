import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBar implements OnInit {
  value = input<string>('');
  searched = output<string>();
  draft = signal('');

  ngOnInit() {
    this.draft.set(this.value() ?? '');
  }

  onInput(e: Event) {
    this.draft.set((e.target as HTMLInputElement).value);
  }

  submit(): void {
    const normalized = this.normalize(this.draft());
    if (normalized) {
      this.searched.emit(normalized);
    }
  }

  private normalize(v: string): string {
    return v
      .trim()
      .toLowerCase()
      .replaceAll(/([\s-]+)/g, '_')
      .replaceAll(/_+/g, '_')
      .replaceAll(/(^_+)|(_+$)/g, '');
  }
}
