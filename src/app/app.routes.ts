import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth';
import { guestGuard } from '../guards/guest';

export const routes: Routes = [
  // Landing page (public)
  {
    path: '',
    loadComponent: () => import('../components/landing/landing').then(m => m.LandingComponent)
  },

  // Auth routes (public, redirect if authenticated)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('../components/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('../components/signup/signup').then(m => m.SignupComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('../components/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('../components/reset-password/reset-password').then(m => m.ResetPasswordComponent)
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
    loadComponent: () => import('../components/dashboard/dashboard').then(m => m.DashboardComponent)
  },

  // Analytics (protected)
  {
    path: 'analytics/:id',
    canActivate: [authGuard],
    loadComponent: () => import('../components/analytics/analytics').then(m => m.AnalyticsComponent)
  },

  // Wildcard - redirect to home
  {
    path: '**',
    redirectTo: ''
  }
];
