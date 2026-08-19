import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { GroupCategoryApiService, PagedResult } from '../../services/api.service';
import { GroupCategoryNavigationService } from '../../services/navigation.service';
import { GroupCategoryFilter } from '../../models/filter.model';
import { GroupCategory, GroupCategoryDiff, GroupCategoryDraftData, GroupCategoryFormValue } from '../../models/model';
import { ParamStatus } from '../../models/status.enum';
import { SearchFilterComponent } from '../../components/search-filter/search-filter';
import { DataGridComponent } from '../../components/data-grid/data-grid';
import { ConfirmDialogComponent, ConfirmDialogConfig } from '../../components/confirm-dialog/confirm-dialog';
import { DetailDialogComponent } from '../../components/detail-dialog/detail-dialog';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-group-category-list-page',
  templateUrl: './list-page.component.html',
  standalone: true,
  imports: [SearchFilterComponent, DataGridComponent, ConfirmDialogComponent, DetailDialogComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupCategoryListPageComponent implements OnInit {
  filter: GroupCategoryFilter = this.createDefaultFilter();
  data: PagedResult<GroupCategory> | null = null;
  loading = false;
  exporting = false;
  selectedIds = new Set<number>();
  
  // Detail dialog state
  showDetailDialog = false;
  selectedRecord: GroupCategory | null = null;
  selectedDiff: any = null;
  
  showSubmitDialog = false;
  showApproveDialog = false;
  showRejectDialog = false;
  showCancelApprovalDialog = false;
  showDeleteDialog = false;
  
  submitDialogConfig: ConfirmDialogConfig = {
    title: 'Gửi duyệt',
    message: 'Bạn có chắc chắn gửi duyệt các bản ghi đã chọn?',
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
    message: 'Bạn có chắc chắn hủy phê duyệt các bản ghi đã chọn?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    icon: 'warning'
  };

  deleteDialogConfig: ConfirmDialogConfig = {
    title: 'Xóa bản ghi',
    message: 'Bạn có chắc chắn xóa các bản ghi đã chọn?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    icon: 'warning'
  };

  private readonly diffFields: (keyof GroupCategoryFormValue)[] = [
    'paramName',
    'paramValue',
    'paramType',
    'componentCode',
    'description',
    'effectiveDate',
    'endEffectiveDate',
  ];

  constructor(
    private readonly api: GroupCategoryApiService,
    private readonly navigationService: GroupCategoryNavigationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private createDefaultFilter(): GroupCategoryFilter {
    return {
      page: 1,
      pageSize: 20,
      sortField: 'updatedDate',
      sortOrder: 'DESC',
    };
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.api
      .search(this.filter)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (res: any) => {
          if (res && Array.isArray(res.content)) {
            this.data = this.applyClientSort(res);
          } else {
            this.data = {
              content: [],
              totalElements: 0,
              totalPages: 0,
              page: this.filter.page - 1,
              size: this.filter.pageSize
            };
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.data = {
            content: [],
            totalElements: 0,
            totalPages: 0,
            page: 0,
            size: this.filter.pageSize
          };
          this.cdr.markForCheck();
        }
      });
  }

  onSearch(filter: GroupCategoryFilter): void {
    this.filter = {
      ...this.filter,
      ...filter,
      page: 1,
      sortField: this.filter.sortField ?? 'updatedDate',
      sortOrder: this.filter.sortOrder ?? 'DESC',
    };
    this.selectedIds = new Set();
    this.load();
  }

  onReset(): void {
    this.filter = this.createDefaultFilter();
    this.selectedIds = new Set();
    this.load();
  }

  onPageChange(page: number): void {
    this.filter = { ...this.filter, page };
    this.load();
  }

  onSelectionChange(ids: Set<number>): void {
    this.selectedIds = ids;
    this.cdr.markForCheck();
  }

  onRowDoubleClick(row: GroupCategory): void {
    this.selectedIds = new Set();
    this.selectedRecord = row;
    this.selectedDiff = this.buildDiff(row);
    this.showDetailDialog = true;
    this.cdr.markForCheck();
  }
  onDetailAction(action: 'approve' | 'reject' | 'submit' | 'cancel' | 'delete' | null): void {
    console.log('🟢 List page: onDetailAction received:', action);
    
    if (!action) {
      // Close dialog
      console.log('🟢 Closing detail dialog');
      this.showDetailDialog = false;
      this.selectedRecord = null;
      this.selectedDiff = null;
      this.cdr.markForCheck();
      return;
    }

    // Close detail dialog first
    this.showDetailDialog = false;

    // Handle action with selected record
    if (action === 'submit') {
      console.log('🟢 Opening submit confirm dialog');
      this.submitDialogConfig = {
        ...this.submitDialogConfig,
        message: 'Bạn có chắc chắn gửi duyệt bản ghi này?',
      };
      this.showSubmitDialog = true;
    } else if (action === 'approve') {
      console.log('🟢 Opening approve confirm dialog');
      this.approveDialogConfig = {
        ...this.approveDialogConfig,
        message: 'Bạn có chắc chắn phê duyệt bản ghi này?',
      };
      this.showApproveDialog = true;
    } else if (action === 'reject') {
      console.log('🟢 Opening reject confirm dialog');
      this.showRejectDialog = true;
    } else if (action === 'cancel') {
      console.log('🟢 Opening cancel approval confirm dialog');
      this.cancelApprovalDialogConfig = {
        ...this.cancelApprovalDialogConfig,
        message: 'Bạn có chắc chắn hủy phê duyệt bản ghi này?',
      };
      this.showCancelApprovalDialog = true;
    } else if (action === 'delete' && this.selectedRecord) {
      console.log('🟢 Opening delete confirm dialog');
      this.deleteDialogConfig = {
        ...this.deleteDialogConfig,
        message: 'Bạn có chắc chắn xóa bản ghi này?',
      };
      this.showDeleteDialog = true;
    }
    
    this.cdr.markForCheck();
  }

  onAddNew(): void {
    this.navigationService.navigateToAdd();
  }

  onEdit(row: GroupCategory): void {
    if (row.status === ParamStatus.APPROVED) {
      this.toastService.info('Bản ghi đã phê duyệt không thể cập nhật');
      return;
    }

    this.navigationService.navigateToEdit(row);
  }

  onCopy(row: GroupCategory): void {
    this.navigationService.navigateToCopy(row);
  }

  onSortChange(sort: { field: string; order: 'ASC' | 'DESC' }): void {
    this.filter = {
      ...this.filter,
      page: 1,
      sortField: sort.field,
      sortOrder: sort.order,
    };
    this.load();
  }

  onExport(): void {
    if (this.exporting) return;

    this.exporting = true;
    this.api.exportExcel(this.filter)
      .pipe(finalize(() => {
        this.exporting = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (blob) => {
          this.downloadExport(blob);
          this.toastService.success('Xuất Excel thành công');
        },
        error: (err) => {
          this.toastService.error('Lỗi xuất Excel: ' + (err.error?.message || err.message));
        }
      });
  }

  onBatchSubmit(): void {
    if (!this.selectedIds.size) return;
    this.selectedRecord = null;
    this.submitDialogConfig = {
      ...this.submitDialogConfig,
      message: 'Bạn có chắc chắn gửi duyệt các bản ghi đã chọn?',
    };
    this.showSubmitDialog = true;
    this.cdr.markForCheck();
  }

  onBatchApprove(): void {
    if (!this.selectedIds.size) return;
    this.selectedRecord = null;
    this.approveDialogConfig = {
      ...this.approveDialogConfig,
      message: 'Bạn có chắc chắn phê duyệt các bản ghi đã chọn?',
    };
    this.showApproveDialog = true;
    this.cdr.markForCheck();
  }

  onBatchReject(): void {
    if (!this.selectedIds.size) return;
    this.selectedRecord = null;
    this.showRejectDialog = true;
    this.cdr.markForCheck();
  }

  onBatchCancelApproval(): void {
    if (!this.selectedIds.size) return;
    this.selectedRecord = null;
    this.cancelApprovalDialogConfig = {
      ...this.cancelApprovalDialogConfig,
      message: 'Bạn có chắc chắn hủy phê duyệt các bản ghi đã chọn?',
    };
    this.showCancelApprovalDialog = true;
    this.cdr.markForCheck();
  }

  onBatchDelete(): void {
    if (!this.selectedIds.size) return;
    this.selectedRecord = null;
    this.deleteDialogConfig = {
      ...this.deleteDialogConfig,
      message: 'Bạn có chắc chắn xóa các bản ghi đã chọn?',
    };
    this.showDeleteDialog = true;
    this.cdr.markForCheck();
  }

  onSubmitConfirmed(result: any): void {
    console.log('📢 onSubmitConfirmed called with result:', result);
    this.showSubmitDialog = false;
    
    if (result.confirmed) {

      if (this.selectedRecord && !this.selectedIds.size) {
        this.api.submit(this.selectedRecord.id).subscribe({
          next: (updated) => {
            this.toastService.success('Gửi duyệt thành công');

            this.updateRecordInList(updated);
            this.selectedRecord = updated;
            this.selectedDiff = null;
          },
          error: (err) => {
            console.error('❌ Submit error:', err);
            console.error('❌ Error details:', err.error);
            this.toastService.error('Lỗi gửi duyệt: ' + (err.error?.message || err.message));
          }
        });
      } else if (this.selectedIds.size > 0) {
        // Batch submit from selection
        const ids = Array.from(this.selectedIds);

        
        this.api.submitBatch(ids).subscribe({
          next: (updatedRecords) => {
            this.toastService.success(`Gửi duyệt thành công ${this.selectedIds.size} bản ghi`);
            // Update all records in-place
            updatedRecords.forEach(record => this.updateRecordInList(record));
            this.selectedIds = new Set();
          },
          error: (err) => {
            this.toastService.error('Lỗi gửi duyệt: ' + (err.error?.message || err.message));
          }
        });
      }
    } else {
      console.log('⚠️ User cancelled');
    }
    
    this.cdr.markForCheck();
  }

  onApproveConfirmed(result: any): void {
    this.showApproveDialog = false;
    
    if (result.confirmed) {
      if (this.selectedRecord && !this.selectedIds.size) {
        // Single record approve
        this.api.approve(this.selectedRecord.id).subscribe({
          next: (updated) => {
            this.toastService.success('Phê duyệt thành công');
            this.updateRecordInList(updated);
            this.selectedRecord = updated;
            this.selectedDiff = null;
          },
          error: (err) => {
            this.toastService.error('Lỗi phê duyệt: ' + (err.error?.message || err.message));
          }
        });
      } else if (this.selectedIds.size > 0) {
        // Batch approve
        const ids = Array.from(this.selectedIds);
        this.api.approveBatch(ids).subscribe({
          next: (updatedRecords) => {
            this.toastService.success(`Phê duyệt thành công ${this.selectedIds.size} bản ghi`);
            updatedRecords.forEach(record => this.updateRecordInList(record));
            this.selectedIds = new Set();
          },
          error: (err) => {
            this.toastService.error('Lỗi phê duyệt: ' + (err.error?.message || err.message));
          }
        });
      }
    }
    
    this.cdr.markForCheck();
  }

  onRejectConfirmed(result: any): void {
    this.showRejectDialog = false;
    
    if (result.confirmed) {
      const reason = result.inputValue || 'Không có lý do';
      
      if (this.selectedRecord && !this.selectedIds.size) {
        // Single record reject
        this.api.reject(this.selectedRecord.id, reason).subscribe({
          next: (updated) => {
            this.toastService.success('Từ chối thành công');
            this.updateRecordInList(updated);
            this.selectedRecord = updated;
            this.selectedDiff = null;
          },
          error: (err) => {
            this.toastService.error('Lỗi từ chối: ' + (err.error?.message || err.message));
          }
        });
      } else if (this.selectedIds.size > 0) {
        // Batch reject
        const ids = Array.from(this.selectedIds);
        this.api.rejectBatch(ids, reason).subscribe({
          next: (updatedRecords) => {
            this.toastService.success(`Từ chối thành công ${this.selectedIds.size} bản ghi`);
            updatedRecords.forEach(record => this.updateRecordInList(record));
            this.selectedIds = new Set();
          },
          error: (err) => {
            this.toastService.error('Lỗi từ chối: ' + (err.error?.message || err.message));
          }
        });
      }
    }
    
    this.cdr.markForCheck();
  }

  onCancelApprovalConfirmed(result: any): void {
    this.showCancelApprovalDialog = false;
    
    if (result.confirmed) {
      if (this.selectedRecord && !this.selectedIds.size) {
        // Single record cancel approval
        this.api.cancelApproval(this.selectedRecord.id).subscribe({
          next: (updated) => {
            this.toastService.success('Hủy phê duyệt thành công');
            this.updateRecordInList(updated);
            this.selectedRecord = updated;
            this.selectedDiff = null;
          },
          error: (err) => {
            this.toastService.error('Lỗi hủy phê duyệt: ' + (err.error?.message || err.message));
          }
        });
      } else if (this.selectedIds.size > 0) {
        // Batch cancel approval
        const ids = Array.from(this.selectedIds);
        this.api.cancelApprovalBatch(ids).subscribe({
          next: (updatedRecords) => {
            this.toastService.success(`Hủy phê duyệt thành công ${this.selectedIds.size} bản ghi`);
            updatedRecords.forEach(record => this.updateRecordInList(record));
            this.selectedIds = new Set();
          },
          error: (err) => {
            this.toastService.error('Lỗi hủy phê duyệt: ' + (err.error?.message || err.message));
          }
        });
      }
    }
    
    this.cdr.markForCheck();
  }

  onDeleteConfirmed(result: any): void {
    this.showDeleteDialog = false;

    if (result.confirmed) {
      if (this.selectedRecord && !this.selectedIds.size) {
        const deletedId = this.selectedRecord.id;
        this.api.delete(deletedId).subscribe({
          next: () => {
            this.toastService.success('Xóa thành công');
            this.removeRecordsFromList([deletedId]);
            this.selectedRecord = null;
            this.selectedDiff = null;
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.toastService.error('Lỗi xóa: ' + (err.error?.message || err.message));
          }
        });
      } else if (this.selectedIds.size > 0) {
        const ids = Array.from(this.selectedIds);
        this.api.deleteBatch(ids).subscribe({
          next: () => {
            this.toastService.success(`Xóa thành công ${ids.length} bản ghi`);
            this.removeRecordsFromList(ids);
            this.selectedIds = new Set();
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.toastService.error('Lỗi xóa: ' + (err.error?.message || err.message));
          }
        });
      }
    }

    this.cdr.markForCheck();
  }

  // Helper method to update record in list without reloading
  private updateRecordInList(updated: GroupCategory): void {
    if (this.data && this.data.content) {
      const index = this.data.content.findIndex((r: GroupCategory) => r.id === updated.id);
      if (index !== -1) {
        const content = [...this.data.content];
        content[index] = updated;
        this.data = this.applyClientSort({ ...this.data, content });
        this.cdr.markForCheck();
      }
    }
  }

  private removeRecordsFromList(ids: number[]): void {
    if (!this.data) return;

    const idSet = new Set(ids);
    const content = this.data.content.filter((record) => !idSet.has(record.id));
    const removedCount = this.data.content.length - content.length;
    this.data = {
      ...this.data,
      content,
      totalElements: Math.max(0, this.data.totalElements - removedCount),
    };
  }

  private applyClientSort(data: PagedResult<GroupCategory>): PagedResult<GroupCategory> {
    const field = this.filter.sortField;
    const order = this.filter.sortOrder ?? 'DESC';
    if (!field) return data;

    const direction = order === 'ASC' ? 1 : -1;
    const content = [...data.content].sort((left, right) => {
      const comparison = this.compareValues(
        this.getSortableValue(left, field),
        this.getSortableValue(right, field),
      );

      if (comparison !== 0) return comparison * direction;
      return (right.id ?? 0) - (left.id ?? 0);
    });

    return { ...data, content };
  }

  private getSortableValue(row: GroupCategory, field: string): string | number | null {
    const value = field === 'updatedDate'
      ? row.updatedDate ?? row.createdDate
      : row[field as keyof GroupCategory];
    if (value == null) return null;

    if (field.toLowerCase().includes('date')) {
      const timestamp = new Date(value as string).getTime();
      return Number.isNaN(timestamp) ? null : timestamp;
    }

    if (typeof value === 'number' || typeof value === 'string') {
      return value;
    }

    return String(value);
  }

  private compareValues(left: string | number | null, right: string | number | null): number {
    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    return String(left).localeCompare(String(right), 'vi', { sensitivity: 'base' });
  }

  private downloadExport(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pmh_group_category_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  private buildDiff(row: GroupCategory): GroupCategoryDiff {
    const currentData = this.toFormValue(row);
    const draft = this.readDraftData(row);

    if (!draft || draft.action === 'CANCEL_APPROVAL') {
      return {
        status: row.status,
        oldData: null,
        newData: currentData,
        changedFields: [],
      };
    }

    const draftData = this.toDraftFormValue(draft);
    const newData = { ...currentData, ...draftData };
    const changedFields = this.diffFields.filter((field) => (
      this.normalizeDiffValue(currentData[field]) !== this.normalizeDiffValue(newData[field])
    ));

    return {
      status: row.status,
      oldData: currentData,
      newData,
      changedFields,
    };
  }

  private readDraftData(row: GroupCategory): GroupCategoryDraftData | null {
    if (!row.newData) return null;

    if (typeof row.newData === 'string') {
      try {
        return JSON.parse(row.newData) as GroupCategoryDraftData;
      } catch {
        return null;
      }
    }

    return row.newData;
  }

  private toFormValue(row: GroupCategory): GroupCategoryFormValue {
    return {
      paramName: row.paramName,
      paramValue: row.paramValue,
      paramType: row.paramType,
      componentCode: row.componentCode,
      description: row.description,
      effectiveDate: row.effectiveDate,
      endEffectiveDate: row.endEffectiveDate ?? null,
    };
  }

  private toDraftFormValue(draft: GroupCategoryDraftData): Partial<GroupCategoryFormValue> {
    const result: Partial<GroupCategoryFormValue> = {};
    const record = draft as Record<string, unknown>;

    this.diffFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(record, field)) {
        (result as Record<string, unknown>)[field] = record[field];
      }
    });

    return result;
  }

  private normalizeDiffValue(value: unknown): string {
    return value == null ? '' : String(value).trim();
  }
}
