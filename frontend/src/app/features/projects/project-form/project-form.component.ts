// Project create/edit modal — like a React modal component with a controlled form. @Input ~ props,
// @Output ~ callbacks. Client validators mirror CreateProjectDto (required name/client/date, enum status);
// the server still validates everything independently.
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, ProjectStatus } from '../../../core/services/models';
import { ProjectsService } from '../../../core/services/projects.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="modal-backdrop">
      <form class="modal" role="dialog" aria-modal="true" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h2>{{ project ? 'Edit project' : 'New project' }}</h2>
        @if (error) { <div class="banner-error" role="alert">{{ error }}</div> }
        <div class="field">
          <label for="pname">Name</label>
          <input id="pname" class="input" formControlName="name" />
          @if (form.controls.name.touched && form.controls.name.invalid) { <span class="field-error">Name is required.</span> }
        </div>
        <div class="field">
          <label for="pclient">Client name</label>
          <input id="pclient" class="input" formControlName="clientName" />
          @if (form.controls.clientName.touched && form.controls.clientName.invalid) { <span class="field-error">Client name is required.</span> }
        </div>
        <div class="field">
          <label for="pstatus">Status</label>
          <select id="pstatus" class="input" formControlName="status">
            @for (s of statuses; track s) { <option [value]="s">{{ s.replace('_', ' ') }}</option> }
          </select>
        </div>
        <div class="field">
          <label for="pstart">Start date</label>
          <input id="pstart" class="input" type="date" formControlName="startDate" />
          @if (form.controls.startDate.touched && form.controls.startDate.invalid) { <span class="field-error">Start date is required.</span> }
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" (click)="cancel.emit()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
        </div>
      </form>
    </div>
  `,
})
export class ProjectFormComponent implements OnInit {
  @Input() project: Project | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  statuses: ProjectStatus[] = ['ACTIVE', 'COMPLETED', 'ON_HOLD'];
  saving = false;
  error = '';
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    clientName: ['', Validators.required],
    status: ['ACTIVE' as ProjectStatus, Validators.required],
    startDate: ['', Validators.required],
  });

  constructor(private readonly fb: FormBuilder, private readonly projects: ProjectsService) {}

  ngOnInit(): void {
    if (this.project) {
      this.form.patchValue({ ...this.project, startDate: this.project.startDate.slice(0, 10) });
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';
    const value = this.form.getRawValue();
    const req = this.project ? this.projects.update(this.project.id, value) : this.projects.create(value);
    req.subscribe({
      next: () => this.saved.emit(),
      error: (e) => {
        this.saving = false;
        this.error = e.status === 403 ? 'You do not have access to this project.' : 'Could not save the project. Please try again.';
      },
    });
  }
}
