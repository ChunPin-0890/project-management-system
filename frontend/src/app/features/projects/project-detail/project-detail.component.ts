// Project detail page — task table with filters (status/assignee/due-date range) and offset
// pagination. Local state lives in BehaviorSubjects (page data, loading, error) rendered with the
// async pipe; any filter change re-queries the server (all filtering/pagination is server-side).
import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Project, Task, TaskFilters, TaskPage, UserSummary } from '../../../core/services/models';
import { ProjectsService } from '../../../core/services/projects.service';
import { TasksService } from '../../tasks/tasks.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { ErrorComponent } from '../../../shared/error/error.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, ReactiveFormsModule, LoadingComponent, ErrorComponent, EmptyStateComponent,
    StatusBadgeComponent, ProjectFormComponent, TaskFormComponent],
  template: `
    <p class="body-sm"><a routerLink="/projects">Back to projects</a></p>

    @if (project$ | async; as project) {
      <div class="page-header">
        <div>
          <h1>{{ project.name }}</h1>
          <span class="body-sm">{{ project.clientName }}</span> <app-status-badge [status]="project.status" />
        </div>
        <div class="actions">
          <button type="button" class="btn" (click)="editingProject = true">Edit project</button>
          <button type="button" class="btn btn-danger" (click)="deleteProject(project)">Delete project</button>
          <button type="button" class="btn btn-primary" (click)="openTaskForm(null)">New task</button>
        </div>
      </div>
    }

    <form class="card filters" [formGroup]="filterForm" (ngSubmit)="applyFilters()">
      <div class="field">
        <label for="fstatus">Status</label>
        <select id="fstatus" class="input" formControlName="status">
          <option value="">All</option><option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option><option value="COMPLETED">COMPLETED</option>
        </select>
      </div>
      <div class="field">
        <label for="fassignee">Assignee</label>
        <select id="fassignee" class="input" formControlName="assigneeId">
          <option value="">All</option>
          @for (u of users; track u.id) { <option [value]="u.id">{{ u.name }}</option> }
        </select>
      </div>
      <div class="field">
        <label for="ffrom">Due from</label>
        <input id="ffrom" class="input" type="date" formControlName="dueDateFrom" />
      </div>
      <div class="field">
        <label for="fto">Due to</label>
        <input id="fto" class="input" type="date" formControlName="dueDateTo" />
      </div>
      <div class="field"><button type="submit" class="btn">Apply filters</button></div>
    </form>
    @if (rangeInvalid) { <div class="banner-error">The "Due from" date must be on or before "Due to".</div> }

    @if (loading$ | async) {
      <app-loading />
    } @else if (error$.value) {
      <app-error [message]="error$.value!"(retry)="load()" />
    } @else {
     @if (page$ | async; as page) {
      @if (page.items.length === 0) {
        <app-empty-state message="No tasks match these filters." />
      } @else {
        <div class="card table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Status</th><th>Assignee</th><th>Due date</th><th>Actions</th></tr></thead>
            <tbody>
              @for (t of page.items; track t.id) {
                <tr>
                  <td>{{ t.title }}</td>
                  <td><app-status-badge [status]="t.status" /></td>
                  <td>{{ userName(t.assigneeId) }}</td>
                  <td>{{ t.dueDate ? t.dueDate.slice(0, 10) : 'No due date' }}</td>
                  <td class="row-actions">
                    <button type="button" class="btn" (click)="openTaskForm(t)">Edit</button>
                    @if (t.status !== 'COMPLETED') {
                      <button type="button" class="btn" (click)="complete(t)">Mark complete</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="pager">
          <button type="button" class="btn" [disabled]="page.page <= 1" (click)="goTo(page.page - 1)">Previous</button>
          <span class="body-sm">Page {{ page.page }} of {{ totalPages(page) }} ({{ page.total }} tasks)</span>
          <button type="button" class="btn" [disabled]="page.page >= totalPages(page)" (click)="goTo(page.page + 1)">Next</button>
        </div>
      }
     }
    }

    @if (actionError) { <div class="banner-error" role="alert">{{ actionError }}</div> }

    @if (editingProject && (project$ | async); as project) {
      <app-project-form [project]="project" (saved)="editingProject = false; loadProject()" (cancel)="editingProject = false" />
    }
    @if (showTaskForm) {
      <app-task-form [projectId]="projectId" [task]="editingTask" [users]="users"
        (saved)="showTaskForm = false; load()" (cancel)="showTaskForm = false" (reload)="reloadEditingTask()" />
    }
  `,
  styles: [`
    .actions, .row-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .filters { display: flex; gap: var(--space-4); flex-wrap: wrap; align-items: flex-end; padding: var(--space-4) var(--space-4) 0; margin-bottom: var(--space-4); }
    .pager { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-top: var(--space-4); }
  `],
})
export class ProjectDetailComponent implements OnInit {
  projectId = '';
  users: UserSummary[] = [];
  filters: TaskFilters = { page: 1, limit: 10 };
  rangeInvalid = false;
  editingProject = false;
  showTaskForm = false;
  editingTask: Task | null = null;
  actionError = '';

  readonly project$ = new BehaviorSubject<Project | null>(null);
  readonly page$ = new BehaviorSubject<TaskPage | null>(null);
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly error$ = new BehaviorSubject<string | null>(null);

  filterForm = this.fb.nonNullable.group({ status: [''], assigneeId: [''], dueDateFrom: [''], dueDateTo: [''] });

  constructor(
    private readonly route: ActivatedRoute, private readonly router: Router, private readonly fb: FormBuilder,
    private readonly projects: ProjectsService, private readonly tasks: TasksService,
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.tasks.users().subscribe({ next: (u) => (this.users = u), error: () => (this.users = []) });
    this.loadProject();
    this.load();
  }

  loadProject(): void {
    this.projects.get(this.projectId).subscribe({
      next: (p) => this.project$.next(p),
      error: (e) => this.error$.next(e.status === 403 ? 'You do not have access to this project.' : 'Could not load the project.'),
    });
  }

  load(): void {
    this.loading$.next(true);
    this.error$.next(null);
    this.tasks.list(this.projectId, this.filters).subscribe({
      next: (p) => { this.page$.next(p); this.loading$.next(false); },
      error: (e) => {
        this.loading$.next(false);
        this.error$.next(e.status === 403 ? 'You do not have access to this project.' : 'Could not load tasks.');
      },
    });
  }

  applyFilters(): void {
    const v = this.filterForm.getRawValue();
    this.rangeInvalid = !!v.dueDateFrom && !!v.dueDateTo && v.dueDateFrom > v.dueDateTo;
    if (this.rangeInvalid) return;
    this.filters = {
      page: 1, limit: this.filters.limit,
      status: (v.status || undefined) as TaskFilters['status'],
      assigneeId: v.assigneeId || undefined,
      dueDateFrom: v.dueDateFrom || undefined,
      dueDateTo: v.dueDateTo || undefined,
    };
    this.load();
  }

  goTo(page: number): void { this.filters = { ...this.filters, page }; this.load(); }
  totalPages(p: TaskPage): number { return Math.max(1, Math.ceil(p.total / p.limit)); }
  userName(id: string | null): string { return id ? (this.users.find((u) => u.id === id)?.name ?? 'Unknown') : 'Unassigned'; }

  openTaskForm(task: Task | null): void { this.editingTask = task; this.showTaskForm = true; }

  /** After a 409: re-fetch and re-open the form with the latest server copy of the task. */
  reloadEditingTask(): void {
    const id = this.editingTask?.id;
    this.showTaskForm = false;
    this.tasks.list(this.projectId, this.filters).subscribe({
      next: (p) => {
        this.page$.next(p);
        const fresh = p.items.find((t) => t.id === id) ?? null;
        if (fresh) this.openTaskForm(fresh);
      },
      error: () => this.error$.next('Could not reload tasks.'),
    });
  }

  complete(t: Task): void {
    this.actionError = '';
    this.tasks.complete(this.projectId, t.id).subscribe({
      next: () => this.load(),
      error: () => (this.actionError = 'Could not mark the task complete. Please try again.'),
    });
  }

  deleteProject(p: Project): void {
    if (!confirm(`Delete project "${p.name}" and all its tasks?`)) return;
    this.projects.remove(p.id).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () => (this.actionError = 'Could not delete the project. Please try again.'),
    });
  }
}
