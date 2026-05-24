import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkService } from '@/services/link';
import { TimeAgoPipe } from '@/pipes/time-format';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class AnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private linkService = inject(LinkService);

  // State
  selectedLink = this.linkService.selectedLink;
  analytics = this.linkService.analytics;
  loading = this.linkService.loading;
  error = this.linkService.error;

  // Copy state
  copiedLink = signal(false);

  // Computed
  topCountry = computed(() => {
    const analytics = this.analytics();
    if (!analytics?.clicksByCountry?.length) return null;
    return analytics.clicksByCountry[0];
  });

  topDevice = computed(() => {
    const analytics = this.analytics();
    if (!analytics?.clicksByDevice?.length) return null;
    return analytics.clicksByDevice[0];
  });

  topBrowser = computed(() => {
    const analytics = this.analytics();
    if (!analytics?.clicksByBrowser?.length) return null;
    return analytics.clicksByBrowser[0];
  });

  ngOnInit(): void {
    const linkId = this.route.snapshot.paramMap.get('id');
    if (linkId) {
      this.loadAnalytics(linkId);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loadAnalytics(linkId: string): void {
    this.linkService.getAnalytics(linkId).subscribe({
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

  getCountryFlag(country: string): string {
    const flags: { [key: string]: string } = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'India': '🇮🇳',
      'Nigeria': '🇳🇬',
      'Brazil': '🇧🇷',
      'China': '🇨🇳',
      'Japan': '🇯🇵',
    };
    return flags[country] || '🌍';
  }

  getDeviceIcon(device: string): string {
    const icons: { [key: string]: string } = {
      'Desktop': '💻',
      'Mobile': '📱',
      'Tablet': '📱',
      'Other': '🖥️'
    };
    return icons[device] || '🖥️';
  }

  getBrowserIcon(browser: string): string {
    const icons: { [key: string]: string } = {
      'Chrome': '🔵',
      'Firefox': '🟠',
      'Safari': '🔵',
      'Edge': '🔵',
      'Opera': '🔴',
      'Other': '🌐'
    };
    return icons[browser] || '🌐';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}