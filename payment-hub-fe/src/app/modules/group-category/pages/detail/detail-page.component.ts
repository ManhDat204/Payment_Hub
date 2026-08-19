import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCategoryNavigationService, NavigationState } from '../../services/navigation.service';
import { GroupCategoryApiService } from '../../services/api.service';
import { GroupCategory } from '../../models/model';
import { DetailDialogComponent } from '../../components/detail-dialog/detail-dialog';
import { ConfirmDialogComponent, ConfirmDialogConfig } from '../../components/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-group-category-detail-page',
  templateUrl: './detailpage.component.html',
  standalone: true,
  imports: [CommonModule, DetailDialogComponent, ConfirmDialogComponent],
})
export class GroupCategoryDetailPageComponent implements OnInit {
  record: GroupCategory | null = null;
  diff: any = null;
  navigationState: NavigationState | null = null;
  
  showSubmitDialog = false;
  showApproveDialog = false;
  showRejectDialog = false;
  showCancelApprovalDialog = false;
  
  submitDialogConfig: ConfirmDialogConfig = {
    title: 'Gửi duyệt',
    message: 'Bạn có chắc chắn gửi duyệt bản ghi này?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    icon: 'question'
  };
  
  approveDialogConfig: ConfirmDialogConfig = {
    title: 'Phê duyệt',
    message: 'Bạn có chắc chắn phê duyệt bản ghi này?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    icon: 'question'
  };
  
  rejectDialogConfig: ConfirmDialogConfig = {
    title: 'Lý do từ chối',
    message: '',
    showInput: true,
    inputLabel: '',
    inputPlaceholder: 'Nhập lý do từ chối',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    icon: 'warning'
  };
  
  cancelApprovalDialogConfig: ConfirmDialogConfig = {
    title: 'Hủy phê duyệt',
    message: 'Bạn có chắc chắn hủy phê duyệt bản ghi này?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    icon: 'warning'
  };

  constructor(
    private readonly navigationService: GroupCategoryNavigationService,
    private readonly api: GroupCategoryApiService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.navigationService.navigation$.subscribe((state: NavigationState) => {
      this.navigationState = state;
      if (state.mode === 'detail') {
        this.record = state.record || null;
        this.diff = state.diff || null;
      }
    });
  }

  onAction(action: 'approve' | 'reject' | 'submit' | 'cancel' | 'delete' | null): void {
    if (!action) {
      this.navigationService.navigateToList();
      return;
    }

    if (action === 'submit') {
      this.showSubmitDialog = true;
      this.cdr.markForCheck();
    } else if (action === 'approve') {
      this.showApproveDialog = true;
      this.cdr.markForCheck();
    } else if (action === 'reject') {
      this.showRejectDialog = true;
      this.cdr.markForCheck();
    } else if (action === 'cancel') {
      this.showCancelApprovalDialog = true;
      this.cdr.markForCheck();
    } else if (action === 'delete') {
      this.navigationService.navigateToList();
    }
  }

  onApproveConfirmed(result: { confirmed: boolean; inputValue?: string }): void {
    this.showApproveDialog = false;
    
    if (result.confirmed && this.record) {
      console.log('Approving record:', this.record.id);
      
      this.api.approve(this.record.id).subscribe({
        next: () => {
          this.toastService.success('Phê duyệt thành công');
          this.navigationService.navigateToList();
        },
        error: (err) => {
          console.error('Approve error:', err);
          this.toastService.error('Lỗi phê duyệt: ' + (err.error?.message || err.message));
        }
      });
    }
    
    this.cdr.markForCheck();
  }

  onRejectConfirmed(result: { confirmed: boolean; inputValue?: string }): void {
    this.showRejectDialog = false;
    
    if (result.confirmed && this.record) {
      const reason = result.inputValue || 'Không có lý do';
      
      console.log('Rejecting record:', this.record.id, 'Reason:', reason);
      
      this.api.reject(this.record.id, reason).subscribe({
        next: () => {
          this.toastService.success('Từ chối thành công');
          this.navigationService.navigateToList();
        },
        error: (err) => {
          console.error('Reject error:', err);
          this.toastService.error('Lỗi từ chối: ' + (err.error?.message || err.message));
        }
      });
    }
    
    this.cdr.markForCheck();
  }

  onBack(): void {
    this.navigationService.navigateToList();
  }

  onSubmitConfirmed(result: { confirmed: boolean; inputValue?: string }): void {
    this.showSubmitDialog = false;
    
    if (result.confirmed && this.record) {
      console.log('Submitting record:', this.record.id);
      
      this.api.submit(this.record.id).subscribe({
        next: () => {
          this.toastService.success('Gửi duyệt thành công');
          this.navigationService.navigateToList();
        },
        error: (err) => {
          console.error('Submit error:', err);
          this.toastService.error('Lỗi gửi duyệt: ' + (err.error?.message || err.message));
        }
      });
    }
    
    this.cdr.markForCheck();
  }

  onCancelApprovalConfirmed(result: { confirmed: boolean; inputValue?: string }): void {
    this.showCancelApprovalDialog = false;
    
    if (result.confirmed && this.record) {
      console.log('Canceling approval for record:', this.record.id);
      
      this.api.cancelApproval(this.record.id).subscribe({
        next: () => {
          this.toastService.success('Hủy phê duyệt thành công');
          this.navigationService.navigateToList();
        },
        error: (err) => {
          console.error('Cancel approval error:', err);
          this.toastService.error('Lỗi hủy phê duyệt: ' + (err.error?.message || err.message));
        }
      });
    }
    
    this.cdr.markForCheck();
  }
}
