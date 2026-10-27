
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page')
        .then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: { role: 'admin' },
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page')
        .then(m => m.DashboardPage)
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/productos/productos.page')
        .then(m => m.ProductosPage)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    data: { role: 'admin' },
    loadComponent: () =>
      import('./pages/usuarios/usuarios.page')
        .then(m => m.UsuariosPage)
  },
  {
    path: 'ayuda',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/ayuda/ayuda.page')
        .then(m => m.AyudaPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
