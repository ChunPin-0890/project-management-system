// Route table — like React Router's <Routes>; canActivate ~ a private-route wrapper.
// Components are lazy-loaded (loadComponent ~ React.lazy).
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-list/project-list.component').then((m) => m.ProjectListComponent),
  },
  {
    path: 'projects/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'projects' },
  { path: '**', redirectTo: 'projects' },
];
