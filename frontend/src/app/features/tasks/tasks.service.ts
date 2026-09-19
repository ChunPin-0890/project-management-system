// Tasks data service (+ users lookup for the assignee picker) — plain HttpClient wrappers;
// component-level state uses BehaviorSubjects in the page component. Nearest React analogue:
// an API client module consumed by hooks.
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskFilters, TaskPage, TaskStatus, UserSummary } from '../../core/services/models';

export interface TaskPayload {
  title: string;
  status?: TaskStatus;
  assigneeId?: string | null;
  dueDate?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private readonly http: HttpClient) {}

  list(projectId: string, f: TaskFilters): Observable<TaskPage> {
    let params = new HttpParams().set('page', f.page).set('limit', f.limit);
    if (f.status) params = params.set('status', f.status);
    if (f.assigneeId) params = params.set('assigneeId', f.assigneeId);
    if (f.dueDateFrom) params = params.set('dueDateFrom', f.dueDateFrom);
    if (f.dueDateTo) params = params.set('dueDateTo', f.dueDateTo);
    return this.http.get<TaskPage>(`/api/projects/${projectId}/tasks`, { params });
  }

  create(projectId: string, t: TaskPayload): Observable<Task> {
    return this.http.post<Task>(`/api/projects/${projectId}/tasks`, t);
  }

  update(projectId: string, id: string, t: TaskPayload & { version: number }): Observable<Task> {
    return this.http.patch<Task>(`/api/projects/${projectId}/tasks/${id}`, t);
  }

  complete(projectId: string, id: string): Observable<Task> {
    return this.http.patch<Task>(`/api/projects/${projectId}/tasks/${id}/complete`, {});
  }

  remove(projectId: string, id: string): Observable<void> {
    return this.http.delete<void>(`/api/projects/${projectId}/tasks/${id}`);
  }

  users(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>('/api/users');
  }
}
