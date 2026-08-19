import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCategoryNavigationService, NavigationState } from '../../services/navigation.service';
import { GroupCategory } from '../../models/model';
import { ConfirmDialogComponent, ConfirmDialogConfig } from '../../components/confirm-dialog/confirm-dialog';
import { RejectReasonDialogComponent } from '../../components/reject-reason-dialog/reject-reason-dialog.component';

@Component({
  selector: 'app-group-category-approve-page',
  templateUrl: './approve-page.html',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent, RejectReasonDialogComponent],
})
export class GroupCategoryApprovePageComponent implements OnInit {
  record: GroupCategory | null = null;
  navigationState: NavigationState | null = null;
  mode: 'approve' | 'reject' = 'approve';
  showConfirm = false;
  showRejectReason = false;
  pageTitle = 'Phê duyệt';
  
  approveDialogConfig: ConfirmDialogConfig = {
    title: 'Phê duyệt',
    message: 'Bạn có chắc chắn phê duyệt bản ghi này?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    icon: 'question'
  };

  constructor(private readonly navigationService: GroupCategoryNavigationService) {}

  ngOnInit(): void {
    this.navigationService.navigation$.subscribe((state: NavigationState) => {
      this.navigationState = state;
      if (state.mode === 'approve') {
        this.mode = 'approve';
        this.record = state.record || null;
        this.showConfirm = true;
        this.pageTitle = 'Phê duyệt tham số danh mục theo nhóm';
      } else if (state.mode === 'reject') {
        this.mode = 'reject';
        this.record = state.record || null;
        this.showRejectReason = true;
        this.pageTitle = 'Từ chối tham số danh mục theo nhóm';
      }
    });
  }

  onConfirmed(result: { confirmed: boolean; inputValue?: string }): void {
    if (result.confirmed && this.record) {
      console.log('Approved:', this.record);
    }
    this.navigationService.navigateToList();
  }

  onReasonSubmitted(reason: string | null): void {
    if (reason && this.record) {
      console.log('Rejected:', this.record, 'Reason:', reason);
    }
    this.navigationService.navigateToList();
  }

  onBack(): void {
    this.navigationService.navigateToList();
  }
}
