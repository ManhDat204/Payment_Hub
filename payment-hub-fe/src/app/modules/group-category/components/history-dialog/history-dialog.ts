import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class HistoryDialogComponent implements OnInit, OnChanges {
  @Input() id: number = 0;
  @Output() closed = new EventEmitter<void>();

  data: PagedResult<HistoryLog> | null = null;
  page = 1;
  pageSize = 10;
  loading = false;
  errorMessage = '';
  selectedLogId: number | null = null;

  constructor(private readonly api: GroupCategoryApiService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && !changes['id'].firstChange) {
      this.page = 1;
      this.load();
    }
  }

  load(): void {
    if (!this.id) {
      this.data = this.emptyData();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.api.getHistory(this.id, this.page, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.data = res;
          this.selectedLogId = res.content[0]?.id ?? null;
        },
        error: (error) => {
          this.data = this.emptyData();
          this.errorMessage = error?.error?.message || error?.message || 'Không tải được lịch sử thao tác';
        },
      });
  }

  onPageChange(page: number): void {
    if (page < 1 || page === this.page) {
      return;
    }

    this.page = page;
    this.load();
  }

  onClose(): void {
    this.closed.emit();
  }

  selectLog(log: HistoryLog): void {
    this.selectedLogId = log.id ?? null;
  }

  getInitials(log: HistoryLog): string {
    const name = (log.userName || log.userId || '').trim();
    if (!name) {
      return '--';
    }

    const parts = name.split(/\s+/).slice(-2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  }

  trackByLogId(index: number, log: HistoryLog): number {
    return log.id ?? index;
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
