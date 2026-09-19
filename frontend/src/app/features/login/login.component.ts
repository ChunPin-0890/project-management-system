// Login page — Angular reactive form (FormGroup ~ a React Hook Form / Formik instance) with
// validators mirroring the backend LoginDto (email format, password min length 6).
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="wrap">
      <form class="card box" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Log in</h1>
        @if (error) { <div class="banner-error" role="alert">{{ error }}</div> }
        <div class="field">
          <label for="email">Email</label>
          <input id="email" class="input" type="email" formControlName="email" autocomplete="username" />
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <span class="field-error">Enter a valid email address.</span>
          }
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" class="input" type="password" formControlName="password" autocomplete="current-password" />
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <span class="field-error">Password must be at least 6 characters.</span>
          }
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="submitting">Log in</button>
      </form>
    </div>
  `,
  styles: [`
    .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-4); }
    .box { width: 100%; max-width: 380px; padding: var(--space-5); }
    h1 { margin-bottom: var(--space-4); }
  `],
})
export class LoginComponent {
  error = '';
  submitting = false;
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly router: Router) {}

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (e) => {
        this.submitting = false;
        this.error = e.status === 401 ? 'Invalid email or password.' : 'Could not log in. Please try again.';
      },
    });
  }
}
