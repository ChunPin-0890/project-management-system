// Shared presentational component — like a small React function component with no state.
// All three data-state components (loading/error/empty) share one centered, muted look.
import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `<div class="state" role="status">Loading...</div>`,
  styles: [`.state { text-align: center; padding: var(--space-7) var(--space-4); color: var(--ink-secondary); }`],
})
export class LoadingComponent {}
