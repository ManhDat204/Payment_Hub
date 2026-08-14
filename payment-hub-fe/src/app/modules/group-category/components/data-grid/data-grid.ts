import { Component, EventEmitter, Input, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCategory } from '../../models/model';
import { PagedResult } from '../../services/api.service'; // fixed path
import { ParamStatusLabel, IsActiveLabel } from '../../models/status.enum';

@Component({
  selector: 'app-group-category-grid',
  templateUrl: './data-grid.html',
  styleUrls: ['./data-grid.css'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class DataGridComponent {
  @Input() data: PagedResult<GroupCategory> | null = null;
  @Input() loading = false;
  @Input() selectedIds: Set<number> = new Set();

  @Output() rowDoubleClick = new EventEmitter<GroupCategory>();
  @Output() selectionChange = new EventEmitter<Set<number>>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ field: string; order: 'ASC' | 'DESC' }>();

  Math = Math;

  toggleAll(checked: boolean): void {
    const ids = checked ? new Set(this.data?.content.map((i) => i.id)) : new Set<number>();
    this.selectionChange.emit(ids);
  }

  toggleRow(id: number, checked: boolean): void {
    const next = new Set(this.selectedIds);
    checked ? next.add(id) : next.delete(id);
    this.selectionChange.emit(next);
  }

  getStatusLabel(status: number | undefined): string {
    if (!status) return '-';
    const labels: { [key: number]: string } = {
      1: '1 - Mới',
      3: '3 - Chờ duyệt',
      4: '4 - Đã duyệt',
      5: '5 - Từ chối',
      7: '7 - Hủy duyệt',
    };
    return labels[status] || 'Unknown';
  }

  getStatusClass(status: number | undefined): string {
    if (!status) return 'status-cell';
    const classes: { [key: string]: string } = {
      '1': 'status-cell new',
      '3': 'status-cell pending',
      '4': 'status-cell approved',
      '5': 'status-cell rejected',
      '7': 'status-cell cancelled',
    };
    return classes[String(status)] || 'status-cell';
  }

  getActiveLabel(isActive: number | undefined): string {
    if (isActive === 1) return 'Hoạt động';
    if (isActive === 0) return 'Không hoạt động';
    return '-';
  }

  getActiveClass(isActive: number | undefined): string {
    if (isActive === 1) return 'is-active-cell active';
    if (isActive === 0) return 'is-active-cell inactive';
    return 'is-active-cell';
  }
}