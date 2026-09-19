// Shared empty state — same centered, muted look as loading/error; text only, no icons.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `<div class="state">{{ message }}</div>`,
  styles: [`.state { text-align: center; padding: var(--space-7) var(--space-4); color: var(--ink-secondary); }`],
})
export class EmptyStateComponent {
  @Input() message = 'Nothing here yet.';
}
