import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tham-so/danh-muc-theo-nhom',
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
