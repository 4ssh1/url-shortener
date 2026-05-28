import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@/env/environment';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: `
    <div class="redirect-container">
      <div class="spinner"></div>
      <p>Redirecting you to your destination...</p>
    </div>
  `,
  styles: [
    `
      .redirect-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: system-ui, sans-serif;
        background-color: #f4f5f7;
        color: #2d3748;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #2d3748;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class RedirectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const backHalf = this.route.snapshot.paramMap.get('backHalf');

    if (backHalf) {
      window.location.href = `${environment.apiUrl}/${backHalf}`;
    } else {
      this.router.navigate(['/']);
    }
  }
}
