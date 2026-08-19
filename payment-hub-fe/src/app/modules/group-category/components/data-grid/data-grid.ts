import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCategory } from '../../models/model';
import { PagedResult } from '../../services/api.service';
import { ParamStatus } from '../../models/status.enum';

interface ColumnDef {
  id: string;
  label: string;
  field: keyof GroupCategory | 'checkbox' | 'stt' | 'actions';
  width: number;
  minWidth: number;
  resizable: boolean;
  sortable: boolean;
  fixed: boolean; // Không cho phép di chuyển
}

@Component({
  selector: 'app-group-category-grid',
  templateUrl: './data-grid.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridComponent  {
  @Input() data: PagedResult<GroupCategory> | null = {
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  };
  @Input() loading = false;
  @Input() selectedIds: Set<number> = new Set();

  @Output() rowDoubleClick = new EventEmitter<GroupCategory>();
  @Output() selectionChange = new EventEmitter<Set<number>>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ field: string; order: 'ASC' | 'DESC' }>();
  @Output() edit = new EventEmitter<GroupCategory>();
  @Output() copy = new EventEmitter<GroupCategory>();

  // Column definitions
  columns: ColumnDef[] = [
    { id: 'checkbox', label: '', field: 'checkbox', width: 48, minWidth: 48, resizable: false, sortable: false, fixed: true },
    { id: 'stt', label: 'STT', field: 'stt', width: 60, minWidth: 60, resizable: false, sortable: false, fixed: true },
    { id: 'paramType', label: 'Danh mục theo nhóm', field: 'paramType', width: 200, minWidth: 120, resizable: true, sortable: true, fixed: true },
    { id: 'paramValue', label: 'Giá trị thành phần', field: 'paramValue', width: 180, minWidth: 120, resizable: true, sortable: true, fixed: true },
    { id: 'paramName', label: 'Tên thành phần', field: 'paramName', width: 180, minWidth: 120, resizable: true, sortable: true, fixed: true },
    { id: 'description', label: 'Mô tả', field: 'description', width: 250, minWidth: 150, resizable: true, sortable: false, fixed: false },
    { id: 'componentCode', label: 'Cấu phần xử lý', field: 'componentCode', width: 150, minWidth: 120, resizable: true, sortable: true, fixed: false },
    { id: 'effectiveDate', label: 'Ngày hiệu lực', field: 'effectiveDate', width: 150, minWidth: 120, resizable: true, sortable: true, fixed: false },
    { id: 'endEffectiveDate', label: 'Ngày hết hiệu lực', field: 'endEffectiveDate', width: 150, minWidth: 120, resizable: true, sortable: true, fixed: false },
    { id: 'status', label: 'Trạng thái tham số', field: 'status', width: 150, minWidth: 120, resizable: true, sortable: true, fixed: false },
    { id: 'isActive', label: 'Trạng thái hoạt động', field: 'isActive', width: 150, minWidth: 120, resizable: true, sortable: true, fixed: false },
    { id: 'actions', label: 'Thao tác', field: 'actions', width: 88, minWidth: 88, resizable: false, sortable: false, fixed: true }
  ];

  // Sorting state
  currentSort: { field: string; order: 'ASC' | 'DESC' } | null = null;

  // Resize state
  resizing: { columnId: string; startX: number; startWidth: number } | null = null;

  // Drag state
  dragging: { columnId: string; startIndex: number } | null = null;
  dragOverIndex: number | null = null;

  toggleAll(checked: boolean): void {
    const ids = checked ? new Set(this.data?.content.map((i) => i.id)) : new Set<number>();
    this.selectionChange.emit(ids);
  }

  toggleRow(id: number, checked: boolean): void {
    const next = new Set(this.selectedIds);
    checked ? next.add(id) : next.delete(id);
    this.selectionChange.emit(next);
  }

  get allSelected(): boolean {
    return !!this.data?.content.length && this.data.content.every(item => this.selectedIds.has(item.id));
  }

  // Sort handling
  onSort(column: ColumnDef): void {
    if (!column.sortable) return;
    
    const field = column.field as string;
    let order: 'ASC' | 'DESC' = 'ASC';
    
    if (this.currentSort?.field === field) {
      order = this.currentSort.order === 'ASC' ? 'DESC' : 'ASC';
    }
    
    this.currentSort = { field, order };
    this.sortChange.emit({ field, order });
  }

  get totalWidth(): number {
    return this.columns.reduce((total, column) => total + column.width, 0);
  }

  isSorted(column: ColumnDef): boolean {
    return this.currentSort?.field === column.field;
  }

  getSortIndicator(column: ColumnDef): string {
    if (!this.isSorted(column)) return '';
    return this.currentSort?.order === 'ASC' ? '▲' : '▼';
  }

  onEdit(row: GroupCategory, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canEdit(row)) return;
    this.edit.emit(row);
  }

  onCopy(row: GroupCategory, event: MouseEvent): void {
    event.stopPropagation();
    this.copy.emit(row);
  }

  canEdit(row: GroupCategory): boolean {
    return row.status !== ParamStatus.APPROVED;
  }

  // Resize handling
  onResizeStart(event: MouseEvent, columnId: string): void {
    event.preventDefault();
    const column = this.columns.find(c => c.id === columnId);
    if (!column || !column.resizable) return;

    this.resizing = {
      columnId,
      startX: event.clientX,
      startWidth: column.width
    };

    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResizeMove = (event: MouseEvent): void => {
    if (!this.resizing) return;

    const column = this.columns.find(c => c.id === this.resizing!.columnId);
    if (!column) return;

    const delta = event.clientX - this.resizing.startX;
    const newWidth = Math.max(column.minWidth, this.resizing.startWidth + delta);
    column.width = newWidth;
  };

  private onResizeEnd = (): void => {
    this.resizing = null;
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  };

  // Drag and drop handling
  onDragStart(event: DragEvent, columnId: string, index: number): void {
    const column = this.columns[index];
    if (column.fixed) {
      event.preventDefault();
      return;
    }

    this.dragging = { columnId, startIndex: index };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', columnId);
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    const column = this.columns[index];
    if (column.fixed || !this.dragging) return;

    this.dragOverIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragLeave(): void {
    this.dragOverIndex = null;
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    if (!this.dragging || this.columns[targetIndex].fixed) return;

    const { startIndex } = this.dragging;
    if (startIndex === targetIndex) {
      this.dragging = null;
      this.dragOverIndex = null;
      return;
    }

    // Reorder columns
    const [removed] = this.columns.splice(startIndex, 1);
    this.columns.splice(targetIndex, 0, removed);

    this.dragging = null;
    this.dragOverIndex = null;
  }

  onDragEnd(): void {
    this.dragging = null;
    this.dragOverIndex = null;
  }

  // Get cell value
  getCellValue(row: GroupCategory, column: ColumnDef): any {
    if (column.field === 'checkbox' || column.field === 'stt' || column.field === 'actions') return null;
    return row[column.field as keyof GroupCategory];
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

  getActiveLabel(isActive: number | undefined): string {
    if (isActive === 1) return 'Hoạt động';
    if (isActive === 0) return 'Không hoạt động';
    return '-';
  }

  trackByRowId(index: number, row: any): number {
    return row.id;
  }

  trackByColumnId(index: number, column: ColumnDef): string {
    return column.id;
  }
}
