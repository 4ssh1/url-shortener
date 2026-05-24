import { Routes } from '@angular/router';
import { authGuard } from './src/guards/auth';
import { guestGuard } from './src/guards/guest';

export const routes: Routes = [
  // Landing page (public)
  {
    path: '',
    loadComponent: () => import('./src/components/landing/landing').then(m => m.LandingComponent)
  },

  // Auth routes (public, redirect if authenticated)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./src/components/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./src/components/signup/signup').then(m => m.SignupComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Dashboard (protected)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./src/components/dashboard/dashboard').then(m => m.DashboardComponent)
  },

  // Analytics (protected)
  {
    path: 'analytics/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./src/components/analytics/analytics').then(m => m.AnalyticsComponent)
  },

  // Wildcard - redirect to home
  {
    path: '**',
    redirectTo: ''
  }
];