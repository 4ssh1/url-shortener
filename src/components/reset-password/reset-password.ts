import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  resetPasswordForm!: FormGroup;
  token: string | null = null;

  // Presentation State Signals
  isLoading = signal(false);
  isResetComplete = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit(): void {
    this.authService.resetState();
    // Read the recovery token parsed from the URL string
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.isLoading.set(false);
    this.isResetComplete.set(false);
    this.errorMessage.set(null);
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
    if (!this.token) {
      this.errorMessage.set('Invalid or expired password reset link.');
    }
    this.initForm();
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const requestPayload = {
        token: this.token,
        password: this.resetPasswordForm.value.password
      };

      this.authService.resetPassword(requestPayload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isResetComplete.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update your password. Please try again.');
        }
      });
    }
  }

  toggleVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    } else {
      this.showConfirmPassword.set(!this.showConfirmPassword());
    }
  }

  getPasswordStrengthErrors(): string[] {
    const control = this.resetPasswordForm.get('password');
    const errors: string[] = [];
    if (!control || !control.value) return errors;

    if (control.value.length < 6) {
      errors.push('At least 6 characters long');
    }
    return errors;
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ fieldsMismatch: true });
      return { fieldsMismatch: true };
    }
    return null;
  }

  clearError(): void {
    this.errorMessage.set(null);
  }
}