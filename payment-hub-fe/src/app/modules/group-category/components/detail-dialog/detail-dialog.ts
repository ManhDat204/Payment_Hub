import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton } from '@taiga-ui/core';
import { GroupCategory, GroupCategoryDiff } from '../../models/model';
import { ParamStatus, IsDisplay } from '../../models/status.enum';

type Action = 'approve' | 'reject' | 'submit' | 'cancel' | 'delete';

@Component({
  selector: 'app-group-category-detail-dialog',
  templateUrl: './detail-dialog.html',
  styleUrls: ['./detail-dialog.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, TuiButton],
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
    return this.record.isDisplay === IsDisplay.NOT_APPROVED;
  }

  submit(): void { this.action.emit('submit'); }
  approve(): void { this.action.emit('approve'); }
  reject(): void { this.action.emit('reject'); }
  cancelApproval(): void { this.action.emit('cancel'); }
  delete(): void { this.action.emit('delete'); }
  close(): void { this.action.emit(null); }
}