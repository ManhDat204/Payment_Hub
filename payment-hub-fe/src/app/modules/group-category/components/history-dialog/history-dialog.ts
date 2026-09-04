import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { GroupCategoryApiService, PagedResult } from '../../services/api.service';
import { HistoryLog } from '../../models/model';
import { GroupCategoryPaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-group-category-history-dialog',
  templateUrl: './history-dialog.html',
  styleUrls: ['./history-dialog.css'],
  standalone: true,
  imports: [CommonModule, GroupCategoryPaginationComponent],
})
export class HistoryDialogComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  private allLogs: HistoryLog[] = [];

  data: PagedResult<HistoryLog> | null = null;
  page = 1;
  pageSize = 10;
  loading = false;
  errorMessage = '';
  selectedLogId: number | null = null;

  private readonly actionLabels: Record<string, string> = {
    CREATE: 'Thêm mới',
    UPDATE: 'Cập nhật',
    SUBMIT: 'Gửi duyệt',
    APPROVE: 'Phê duyệt',
    REJECT: 'Từ chối',
    CANCEL_APPROVE: 'Hủy phê duyệt',
    DELETE: 'Xóa',
  };

  constructor(
    private readonly api: GroupCategoryApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.api.getAllHistory()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (logs) => {
          this.allLogs = (logs ?? []).map((log) => ({
            ...log,
            actionTime: this.normalizeDate(log.actionTime),
          }));
          this.page = 1;
          this.applyPage();
        },
        error: (error) => {
          this.allLogs = [];
          this.data = this.emptyData();
          this.errorMessage = error?.error?.message || error?.message || 'Không tải được lịch sử thao tác';
          this.cdr.markForCheck();
        },
      });
  }

  private applyPage(): void {
    const totalElements = this.allLogs.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / this.pageSize));
    const start = (this.page - 1) * this.pageSize;
    const content = this.allLogs.slice(start, start + this.pageSize);

    this.data = {
      content,
      totalElements,
      totalPages,
      page: this.page - 1,
      size: this.pageSize,
    };
    this.selectedLogId = content[0]?.id ?? null;
    this.cdr.markForCheck();
  }

  onPageChange(page: number): void {
    if (page < 1 || page === this.page) {
      return;
    }

    this.page = page;
    this.applyPage();
  }

  onClose(): void {
    this.closed.emit();
  }

  selectLog(log: HistoryLog): void {
    this.selectedLogId = log.id ?? null;
  }

  getActionLabel(actionType: string | null | undefined): string {
    if (!actionType) return '-';
    return this.actionLabels[actionType] ?? actionType;
  }

  getInitials(log: HistoryLog): string {
    const name = (log.actionBy || '').trim();
    if (!name) {
      return '--';
    }

    const parts = name.split(/\s+/).slice(-2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  }

  trackByLogId(index: number, log: HistoryLog): number {
    return log.id ?? index;
  }

  private normalizeDate(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.replace(/(\.\d{3})\d*/, '$1');
  }

  private emptyData(): PagedResult<HistoryLog> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: this.pageSize,
    };
  }
}