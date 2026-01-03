import { Component, computed, input } from '@angular/core';

type IconName = 'arrow-left' | 'external-link';

const ICON_PATHS: Record<IconName, string[]> = {
  'arrow-left': ['M19 12H5', 'M12 19l-7-7 7-7'],
  'external-link': [
    'M15 3h6v6',
    'M10 14L21 3',
    'M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  ],
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @for (path of iconPaths(); track path) {
      <path [attr.d]="path" />
      }
    </svg>
  `,
  host: {
    class: 'inline-flex items-center',
  },
})
export class Icon {
  name = input.required<IconName>();
  size = input(18);
  strokeWidth = input(2);

  iconPaths = computed(() => ICON_PATHS[this.name()]);
}
