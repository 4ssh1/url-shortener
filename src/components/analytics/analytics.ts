import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LinkService } from '@/services/link';
import { TimeAgoPipe } from '@/pipes/time-format';
import { AuthService } from '@/services/auth';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, RouterLink],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class AnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private linkService = inject(LinkService);
  private authService = inject(AuthService);

  // Core Signals
  selectedLink = this.linkService.selectedLink;
  analytics = this.linkService.analytics;
  loading = this.linkService.loading;
  error = this.linkService.error;

  copiedLink = signal(false);

  stats = computed(() => {
    const rawData = this.analytics() as any;
    if (!rawData) return null;
    return rawData.analytics ? rawData.analytics : rawData;
  });

  topCountry = computed(() => {
    const statsData = this.stats();
    if (!statsData?.clicksByCountry?.length) return 'N/A';
    return statsData.clicksByCountry[0].country || 'N/A';
  });

  topDevice = computed(() => {
    const statsData = this.stats();
    if (!statsData?.clicksByDevice?.length) return 'N/A';
    return statsData.clicksByDevice[0].device || 'N/A';
  });

  topBrowser = computed(() => {
    const statsData = this.stats();
    if (!statsData?.clicksByBrowser?.length) return 'N/A';
    return statsData.clicksByBrowser[0].browser || 'N/A';
  });

  ngOnInit(): void {
    this.authService.resetState();
    this.copiedLink.set(false);
    const linkId = this.route.snapshot.paramMap.get('id');
    if (linkId) {
      this.loadAnalytics(linkId);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loadAnalytics(linkId: string): void {
    this.linkService.getAnalytics(linkId).subscribe({
      next: (res: any) => {
        if (res && res.link && !this.selectedLink()) {
          if (typeof (this.linkService.selectedLink as any)?.set === 'function') {
            (this.linkService.selectedLink as any).set(res.link);
          } else {
            (this.linkService as any).selectedLink = signal(res.link);
          }
        }
      },
      error: (error) => {
        console.error('Failed to load analytics:', error);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  async copyLink(): Promise<void> {
    const link = this.selectedLink();
    if (link) {
      const shortUrl = this.linkService.getShortUrl(link.backHalf);
      const success = await this.linkService.copyToClipboard(shortUrl);

      if (success) {
        this.copiedLink.set(true);
        setTimeout(() => this.copiedLink.set(false), 2000);
      }
    }
  }

  getShortUrl(backHalf: string): string {
    return this.linkService.getShortUrl(backHalf);
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}