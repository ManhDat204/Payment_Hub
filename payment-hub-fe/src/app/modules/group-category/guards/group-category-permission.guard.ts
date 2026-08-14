// guards/group-category-permission.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class GroupCategoryPermissionGuard implements CanActivate {
  constructor() {}
  
  canActivate(): boolean {
    // TODO: Inject AuthService when available
    // return this.auth.hasPermission('GROUP_CATEGORY_VIEW');
    // các quyền con: GROUP_CATEGORY_CREATE / EDIT / DELETE / SUBMIT / APPROVE / REJECT / CANCEL_APPROVAL / EXPORT
    // dùng directive *appHasPermission="'GROUP_CATEGORY_APPROVE'" để ẩn/hiện nút trên UI
    
    // Placeholder: allow access for now
    return true;
  }
}