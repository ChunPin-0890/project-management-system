// AuthService — like a React AuthContext provider backed by a store, but DI'd as a singleton
// (providedIn: 'root' ~ AddSingleton in C#). The JWT lives ONLY in this in-memory BehaviorSubject,
// never localStorage, so XSS can't lift it from storage (trade-off: a page refresh logs you out).
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface AuthUser { id: string; email: string; name: string; }
interface LoginResponse { accessToken: string; user: AuthUser; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly token$ = new BehaviorSubject<string | null>(null);
  private readonly user$ = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.user$.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null { return this.token$.value; }
  get isLoggedIn(): boolean { return this.token$.value !== null; }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap((res) => {
        this.token$.next(res.accessToken);
        this.user$.next(res.user);
      }),
    );
  }

  logout(): void {
    this.token$.next(null);
    this.user$.next(null);
  }
}
