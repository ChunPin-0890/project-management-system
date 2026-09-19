// Root component / app shell — like App.tsx with a layout: fixed top nav + left sidebar
// (stacks under the nav below 768px), and <router-outlet> as the page slot.
import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    @if (auth.currentUser$ | async; as user) {
      <header class="nav">
        <span class="app-name">Project Tracker</span>
        <span class="nav-right">
          <span>{{ user.name }}</span>
          <button type="button" class="btn" (click)="logout()">Log out</button>
        </span>
      </header>
      <div class="shell">
        <aside class="sidebar">
          <a routerLink="/projects" routerLinkActive="active" class="nav-item">Projects</a>
        </aside>
        <main class="content"><router-outlet /></main>
      </div>
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    .nav { position: fixed; top: 0; left: 0; right: 0; height: var(--nav-height); z-index: 50;
      display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-4);
      background: var(--surface); border-bottom: 1px solid var(--border); }
    .app-name { font-weight: 600; font-size: 16px; }
    .nav-right { display: flex; align-items: center; gap: var(--space-3); }
    .shell { display: flex; padding-top: var(--nav-height); min-height: 100vh; }
    .sidebar { width: var(--sidebar-width); background: var(--surface-sidebar); border-right: 1px solid var(--border); padding: var(--space-3); }
    .nav-item { display: block; padding: 8px 12px; border-radius: var(--radius-sm); color: var(--ink); text-decoration: none; font-weight: 600; }
    .nav-item:hover { background: var(--surface-hover); }
    .nav-item.active { background: var(--primary-surface); color: var(--primary); }
    .content { flex: 1; padding: var(--space-5); min-width: 0; }
    @media (max-width: 767px) {
      .shell { flex-direction: column; }
      .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); }
    }
  `],
})
export class AppComponent {
  constructor(readonly auth: AuthService, private readonly router: Router) {}
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
