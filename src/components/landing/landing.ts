import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators} from "@/utils/validator";
import { GuestLinkService } from '@/services/guest';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent implements OnInit {
  quickLinkForm!: FormGroup;
  generatedLink = signal<string | null>(null);
  isGenerating = signal(false);
  copySuccess = signal(false);
  errorMessage = signal<string | null>(null);

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private guestLinkService: GuestLinkService
  ) {}

  ngOnInit(): void {
    this.quickLinkForm = this.fb.group({
      url: ['', [Validators.required, CustomValidators.url()]]
    });
    this.generatedLink.set(null);
    this.isGenerating.set(false);
    this.copySuccess.set(false);
    this.errorMessage.set(null);
  }

  onQuickShorten(): void {
    if (this.quickLinkForm.valid) {
      this.isGenerating.set(true);
      this.errorMessage.set(null);
      
      this.guestLinkService.createGuestLink({
        destination: this.quickLinkForm.value.url
      }).subscribe({
        next: (response) => {
          this.generatedLink.set(response.shortLink);
          this.isGenerating.set(false);
        },
        error: (err) => {
          this.isGenerating.set(false);
          if (err.status === 403) {
            this.errorMessage.set('You have used your free creation! Redirecting to signup...');
            setTimeout(() => {
              this.router.navigate(['/auth/signup'], {
                queryParams: { url: this.quickLinkForm.value.url }
              });
            }, 2500);
          } else {
            this.errorMessage.set('An error occurred while generating your link.');
          }
        }
      });
    }
  }

  copyToClipboard(): void {
    const link = this.generatedLink();
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        this.copySuccess.set(true);
        setTimeout(() => this.copySuccess.set(false), 2000);
      });
    }
  }

  closeModal(): void {
    this.generatedLink.set(null);
    this.copySuccess.set(false);
    this.quickLinkForm.reset();
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}