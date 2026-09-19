// Status badge — status is always a bg+text badge showing the status word (never color alone).
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge badge-' + status.toLowerCase()">{{ label }}</span>`,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;
  get label(): string {
    return this.status.replace('_', ' ');
  }
}
