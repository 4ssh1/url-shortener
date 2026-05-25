import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@/services/auth';
import { LinkService } from '@/services/link';
import { CustomValidators } from '@/utils/validator';
import { TimeAgoPipe } from '@/pipes/time-format';
import { Link } from '@/interfaces/link';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TimeAgoPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private linkService = inject(LinkService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // State signals
  currentUser = this.authService.currentUser;
  links = this.linkService.links;
  loading = this.linkService.loading;
  error = this.linkService.error;
  
  // Form signals
  createLinkForm: FormGroup;
  showCreateForm = signal(false);
  showCustomBackHalf = signal(false);
  copiedLinkId = signal<string | null>(null);
  deletingLinkId = signal<string | null>(null);

  // Computed statistics
  totalLinks = this.linkService.totalLinks;
  totalClicks = this.linkService.totalClicks;

  constructor() {
    this.createLinkForm = this.fb.group({
      url: ['', [Validators.required, CustomValidators.url()]],
      customBackHalf: ['', [CustomValidators.backHalf()]]
    });
  }

  ngOnInit(): void {
    this.loadLinks();
  }

  loadLinks(): void {
    this.linkService.getMyLinks().subscribe({
      next: () => {
        console.log('Links loaded:', this.links());
        console.log('Total clicks:', this.totalClicks());
        const avgClicks = this.links().length > 0 ? (this.totalClicks() / this.links().length).toFixed(1) : '0';
        console.log('Average clicks per link:', avgClicks);
      },
      error: (error) => {
        console.error('Error loading links:', error);
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v);
    if (!this.showCreateForm()) {
      this.createLinkForm.reset();
      this.showCustomBackHalf.set(false);
    }
  }

  toggleCustomBackHalf(): void {
    this.showCustomBackHalf.update(v => !v);
    if (!this.showCustomBackHalf()) {
      this.createLinkForm.get('customBackHalf')?.reset();
    }
  }

  onCreateLink(): void {
    if (this.createLinkForm.valid) {
      const request = {
        url: this.createLinkForm.value.url,
        ...(this.showCustomBackHalf() && this.createLinkForm.value.customBackHalf && {
          customBackHalf: this.createLinkForm.value.customBackHalf
        })
      };

      this.linkService.createLink(request).subscribe({
        next: () => {
          this.createLinkForm.reset();
          this.showCreateForm.set(false);
          this.showCustomBackHalf.set(false);
        },
        error: (error) => {
          console.error('Create link error:', error);
        }
      });
    }
  }

  async copyLink(link: Link): Promise<void> {
    const shortUrl = this.linkService.getShortUrl(link.backHalf);
    const success = await this.linkService.copyToClipboard(shortUrl);
    
    if (success) {
      this.copiedLinkId.set(link._id);
      setTimeout(() => this.copiedLinkId.set(null), 2000);
    }
  }

  deleteLink(linkId: string): void {
    if (confirm('Are you sure you want to delete this link?')) {
      this.deletingLinkId.set(linkId);
      this.linkService.deleteLink(linkId).subscribe({
        next: () => {
          this.deletingLinkId.set(null);
        },
        error: () => {
          this.deletingLinkId.set(null);
        }
      });
    }
  }

  viewAnalytics(linkId: string): void {
    this.router.navigate(['/analytics', linkId]);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  getShortUrl(backHalf: string): string {
    return this.linkService.getShortUrl(backHalf);
  }
}