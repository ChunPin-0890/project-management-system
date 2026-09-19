// Projects list page — subscribes to the ProjectsService BehaviorSubjects via the async pipe
// (~ a React component using a store hook). Handles loading / error / empty / data states.
import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { ErrorComponent } from '../../../shared/error/error.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, ErrorComponent, EmptyStateComponent, StatusBadgeComponent, ProjectFormComponent],
  template: `
    <div class="page-header">
      <h1>Projects</h1>
      <button type="button" class="btn btn-primary" (click)="showForm = true">New project</button>
    </div>

    @if (svc.loading$ | async) {
      <app-loading />
    } @else if (svc.error) {
      <app-error [message]="svc.error!"(retry)="svc.load()" />
    } @else if ((svc.projects$ | async)?.length === 0) {
      <app-empty-state message="No projects yet. Create one to get started." />
    } @else {
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Client</th><th>Status</th><th>Start date</th><th>Tasks</th></tr></thead>
          <tbody>
            @for (p of svc.projects$ | async; track p.id) {
              <tr>
                <td><a [routerLink]="['/projects', p.id]">{{ p.name }}</a></td>
                <td>{{ p.clientName }}</td>
                <td><app-status-badge [status]="p.status" /></td>
                <td>{{ p.startDate.slice(0, 10) }}</td>
                <td>{{ p.taskCount ?? 0 }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (showForm) {
      <app-project-form (saved)="showForm = false" (cancel)="showForm = false" />
    }
  `,
})
export class ProjectListComponent implements OnInit {
  showForm = false;
  constructor(readonly svc: ProjectsService) {}
  ngOnInit(): void { this.svc.load(); }
}
