// Data service — like a React custom hook (useProjects) backed by a store, but DI'd as a singleton.
// State lives in BehaviorSubjects (loading/error/data) that components subscribe to via `async` pipe.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Project, ProjectStatus } from './models';

export interface ProjectPayload { name: string; clientName: string; status: ProjectStatus; startDate: string; }

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly projectsSubject = new BehaviorSubject<Project[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  readonly projects$ = this.projectsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  get error(): string | null { return this.errorSubject.value; }

  constructor(private readonly http: HttpClient) {}

  load(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.http.get<Project[]>('/api/projects').subscribe({
      next: (p) => { this.projectsSubject.next(p); this.loadingSubject.next(false); },
      error: () => { this.errorSubject.next('Could not load projects.'); this.loadingSubject.next(false); },
    });
  }

  get(id: string): Observable<Project> { return this.http.get<Project>(`/api/projects/${id}`); }
  create(p: ProjectPayload): Observable<Project> { return this.http.post<Project>('/api/projects', p).pipe(tap(() => this.load())); }
  update(id: string, p: Partial<ProjectPayload>): Observable<Project> { return this.http.patch<Project>(`/api/projects/${id}`, p).pipe(tap(() => this.load())); }
  remove(id: string): Observable<void> { return this.http.delete<void>(`/api/projects/${id}`).pipe(tap(() => this.load())); }
}
