// Shared error state — like a React <ErrorState onRetry={...}/> component. @Input ~ props,
// @Output ~ callback props. Always offers a "Try again" secondary button.
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error',
  standalone: true,
  template: `
    <div class="state" role="alert">
      <p>{{ message }}</p>
      <button type="button" class="btn" (click)="retry.emit()">Try again</button>
    </div>`,
  styles: [`.state { text-align: center; padding: var(--space-7) var(--space-4); color: var(--ink-secondary); }
            p { margin: 0 0 var(--space-3); }`],
})
export class ErrorComponent {
  @Input() message = 'Something went wrong.';
  @Output() retry = new EventEmitter<void>();
}
