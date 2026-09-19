// Task create/edit modal. Sends the `version` it read on edit; on a 409 Conflict it shows a message
// and offers "Reload latest" (re-fetches the task, discarding local edits only when the user asks)
// — it never silently overwrites someone else's change.
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus, UserSummary } from '../../../core/services/models';
import { TasksService } from '../../tasks/tasks.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="modal-backdrop">
      <form class="modal" role="dialog" aria-modal="true" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h2>{{ task ? 'Edit task' : 'New task' }}</h2>
        @if (conflict) {
          <div class="banner-error" role="alert">
            This task was changed by someone else since you opened it. Reload the latest version to continue; your edits are kept until you do.
            <div style="margin-top: 8px"><button type="button" class="btn" (click)="reload.emit()">Reload latest</button></div>
          </div>
        } @else if (error) {
          <div class="banner-error" role="alert">{{ error }}</div>
        }
        <div class="field">
          <label for="ttitle">Title</label>
          <input id="ttitle" class="input" formControlName="title" />
          @if (form.controls.title.touched && form.controls.title.invalid) { <span class="field-error">Title is required.</span> }
        </div>
        <div class="field">
          <label for="tstatus">Status</label>
          <select id="tstatus" class="input" formControlName="status">
            @for (s of statuses; track s) { <option [value]="s">{{ s.replace('_', ' ') }}</option> }
          </select>
        </div>
        <div class="field">
          <label for="tassignee">Assignee</label>
          <select id="tassignee" class="input" formControlName="assigneeId">
            <option value="">Unassigned</option>
            @for (u of users; track u.id) { <option [value]="u.id">{{ u.name }}</option> }
          </select>
        </div>
        <div class="field">
          <label for="tdue">Due date</label>
          <input id="tdue" class="input" type="date" formControlName="dueDate" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" (click)="cancel.emit()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
        </div>
      </form>
    </div>
  `,
})
export class TaskFormComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
  @Input() task: Task | null = null;
  @Input() users: UserSummary[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  /** Parent re-fetches the latest task and re-opens this form with fresh data. */
  @Output() reload = new EventEmitter<void>();

  statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
  saving = false;
  conflict = false;
  error = '';
  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    status: ['TODO' as TaskStatus],
    assigneeId: [''],
    dueDate: [''],
  });

  constructor(private readonly fb: FormBuilder, private readonly tasks: TasksService) {}

  ngOnInit(): void {
    if (this.task) {
      this.form.patchValue({
        title: this.task.title,
        status: this.task.status,
        assigneeId: this.task.assigneeId ?? '',
        dueDate: this.task.dueDate ? this.task.dueDate.slice(0, 10) : '',
      });
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving = true;
    this.conflict = false;
    this.error = '';
    const v = this.form.getRawValue();
    const payload = { title: v.title, status: v.status, assigneeId: v.assigneeId || null, dueDate: v.dueDate || null };
    const req = this.task
      ? this.tasks.update(this.projectId, this.task.id, { ...payload, version: this.task.version })
      : this.tasks.create(this.projectId, {
          ...payload,
          assigneeId: payload.assigneeId ?? undefined,
          dueDate: payload.dueDate ?? undefined,
        } as any);
    req.subscribe({
      next: () => this.saved.emit(),
      error: (e) => {
        this.saving = false;
        if (e.status === 409) this.conflict = true;
        else this.error = 'Could not save the task. Please try again.';
      },
    });
  }
}
