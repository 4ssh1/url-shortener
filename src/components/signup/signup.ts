import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '@/services/auth';
import { CustomValidators } from '@/utils/validator';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class SignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  signupForm!: FormGroup;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = this.authService.loading;
  errorMessage = this.authService.error;

  ngOnInit(): void {
    this.authService.resetState();
    const urlParam = this.route.snapshot.queryParams['url'];
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: CustomValidators.matchFields('password', 'confirmPassword')
    });
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
    // If you want to reset loading and error, do so here if not managed by AuthService
    // this.isLoading.set(false);
    // this.errorMessage.set(null);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.update(v => !v);
    } else {
      this.showConfirmPassword.update(v => !v);
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const { confirmPassword, ...signupData } = this.signupForm.value;
      
      this.authService.signup(signupData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Signup error:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.signupForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  clearError(): void {
    this.authService.clearError();
  }

  getPasswordStrengthErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.signupForm.get('password');
    
    if (passwordControl?.hasError('minLength')) {
      errors.push('At least 8 characters');
    }
    if (passwordControl?.hasError('requiresUppercase')) {
      errors.push('One uppercase letter');
    }
    if (passwordControl?.hasError('requiresLowercase')) {
      errors.push('One lowercase letter');
    }
    if (passwordControl?.hasError('requiresNumber')) {
      errors.push('One number');
    }
    
    return errors;
  }
}