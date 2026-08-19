import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCategory, GroupCategoryDiff } from '../../models/model';
import { ParamStatus, IsDisplay } from '../../models/status.enum';

type Action = 'approve' | 'reject' | 'submit' | 'cancel' | 'delete';

@Component({
  selector: 'app-group-category-detail-dialog',
  templateUrl: './detail-dialog.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class DetailDialogComponent {
  @Input() diff: GroupCategoryDiff | null = null;
  @Input() record: GroupCategory | null = null;
  @Output() action = new EventEmitter<Action | null>();

  isChanged(field: string): boolean {
    if (!this.diff) return false;
    return (this.diff.changedFields as string[]).includes(field);
  }

  get showSubmit(): boolean {
    if (!this.record) return false;
    return [ParamStatus.NEW, ParamStatus.REJECTED, ParamStatus.CANCELLED].includes(this.record.status);
  }
  get showApproveReject(): boolean {
    if (!this.record) return false;
    return this.record.status === ParamStatus.PENDING;
  }
  get showCancelApproval(): boolean {
    if (!this.record) return false;
    return this.record.status === ParamStatus.APPROVED;
  }
  get showDelete(): boolean {
    if (!this.record) return false;
    // Chỉ cho phép xóa khi IS_DISPLAY = 1 (Chưa duyệt)
    return this.record.isDisplay === IsDisplay.NOT_APPROVED;
  }

  submit(): void { 
    console.log('🔵 Detail dialog: submit() called');
    this.action.emit('submit'); 
  }
  approve(): void { 
    console.log('🔵 Detail dialog: approve() called');
    this.action.emit('approve'); 
  }
  reject(): void { 
    console.log('🔵 Detail dialog: reject() called');
    this.action.emit('reject'); 
  }
  cancelApproval(): void { 
    console.log('🔵 Detail dialog: cancelApproval() called');
    this.action.emit('cancel'); 
  }
  delete(): void { 
    console.log('🔵 Detail dialog: delete() called');
    this.action.emit('delete'); 
  }
  close(): void { 
    console.log('🔵 Detail dialog: close() called');
    this.action.emit(null); 
  }
}