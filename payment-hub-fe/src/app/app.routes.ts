import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tham-so/danh-muc-theo-nhom',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/group-category/group-category.module').then(
        (m) => m.GroupCategoryModule
      )
  },
  {
    path: '',
    redirectTo: '/tham-so/danh-muc-theo-nhom',
    pathMatch: 'full'
  }
];
