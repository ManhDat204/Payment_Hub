import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupCategoryContainerComponent } from './pages/container';
import { GroupCategoryPermissionGuard } from './guards/group-category-permission.guard';

const routes: Routes = [
  {
    path: '',
    component: GroupCategoryContainerComponent,
    canActivate: [GroupCategoryPermissionGuard],
    data: { title: 'Quản lý tham số danh mục theo nhóm' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupCategoryRoutingModule {}
