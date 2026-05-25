import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators} from "@/utils/validator";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent {
  quickLinkForm: FormGroup;
  generatedLink = signal<string | null>(null);
  isGenerating = signal(false);

  features = [
    {
      title: 'Lightning Fast',
      description: 'Generate short links instantly with our optimized hashing algorithm'
    },
    {
      title: 'Track Everything',
      description: 'Real-time analytics on every click, location, and device'
    },
    {
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      title: 'Custom Links',
      description: 'Create branded, memorable short links that stand out'
    }
  ];

  stats = [
    { value: '1M+', label: 'Links Shortened' },
    { value: '50M+', label: 'Clicks Tracked' },
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.quickLinkForm = this.fb.group({
      url: ['', [Validators.required, CustomValidators.url()]]
    });
  }

  onQuickShorten(): void {
    if (this.quickLinkForm.valid) {

      this.router.navigate(['/auth/signup'], {
        queryParams: { url: this.quickLinkForm.value.url }
      });
    }
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}