import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { GroupCategoryApiService } from '../../services/api.service';
import { GroupCategoryFilter } from '../../models/filter.model';
import { GroupCategory } from '../../models/model';
import { SearchFilterComponent } from '../../components/search-filter/search-filter';
import { DataGridComponent } from '../../components/data-grid/data-grid';
import { FormDialogComponent } from '../../components/form-dialog/form-dialog';
import { DetailDialogComponent } from '../../components/detail-dialog/detail-dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';
import { RejectReasonDialogComponent } from '../../components/reject-reason-dialog/reject-reason-dialog.component';
import { HistoryDialogComponent } from '../../components/history-dialog/history-dialog';
import { ParamStatus } from '../../models/status.enum';

@Component({
  selector: 'app-group-category-list',
  templateUrl: './group-category-list.component.html',
  styleUrls: ['./group-category-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    SearchFilterComponent,
    DataGridComponent,
    FormDialogComponent,
    DetailDialogComponent,
    ConfirmDialogComponent,
    RejectReasonDialogComponent,
    HistoryDialogComponent,
  ],
})
export class GroupCategoryListComponent implements OnInit {
  filter: GroupCategoryFilter = { page: 1, pageSize: 20 };
  data: any = null;
  loading = false;
  selectedIds = new Set<number>();

  formDialogVisible = false;
  formMode: 'create' | 'edit' | 'copy' = 'create';
  formSource: GroupCategory | null = null;

  detailDialogVisible = false;
  selectedRecord: GroupCategory | null = null;
  detailDiff: any = null;

  confirmDialogVisible = false;
  confirmTitle = 'Xác nhận';
  confirmMessage = 'Bạn có chắc chắn muốn thực hiện thao tác này?';
  pendingConfirmAction: 'submit' | 'approve' | 'cancel' | 'delete' | null = null;

  rejectDialogVisible = false;
  historyDialogVisible = false;
  historyId = 0;

  constructor(private readonly api: GroupCategoryApiService) {}

  ngOnInit(): void {
    this.data = this.getMockData();
    this.load();
  }

  private getMockData(): any {
    return {
      page: 1,
      pageSize: 20,
      total: 6,
      items: [
        { id: 1, paramType: 'ROAD', paramValue: 'TS_REALTIME', paramName: 'Biểu chính hàng tin', description: 'Mô tả giá trị realtime', componentCode: 'IFRT', effectiveDate: '2025-04-05', endEffectiveDate: '2025-04-15', status: 4, isActive: 1 },
        { id: 2, paramType: 'ROAD', paramValue: 'CRP_HDL', paramName: 'Khối xử lý báo cáo', description: 'Danh mục cấu hình báo cáo', componentCode: 'CRP', effectiveDate: '2025-04-06', endEffectiveDate: '2025-04-20', status: 3, isActive: 1 },
        { id: 3, paramType: 'ROAD', paramValue: 'PAY_LINK', paramName: 'Liên kết thanh toán', description: 'Dạng link thanh toán', componentCode: 'PAY', effectiveDate: '2025-04-07', endEffectiveDate: '2025-04-25', status: 1, isActive: 0 },
        { id: 4, paramType: 'BILL', paramValue: 'BILL_PERIOD', paramName: 'Chu kỳ hoá đơn', description: 'Xác định chu kỳ', componentCode: 'BILL', effectiveDate: '2025-04-08', endEffectiveDate: '2025-04-26', status: 5, isActive: 0 },
        { id: 5, paramType: 'CHANNEL', paramValue: 'SMS_GATE', paramName: 'Gateway SMS', description: 'Cổng gửi SMS', componentCode: 'SMS', effectiveDate: '2025-04-09', endEffectiveDate: '2025-04-27', status: 7, isActive: 1 },
        { id: 6, paramType: 'CHANNEL', paramValue: 'EMAIL_GATE', paramName: 'Gateway Email', description: 'Cổng gửi email', componentCode: 'MAIL', effectiveDate: '2025-04-10', endEffectiveDate: '2025-04-30', status: 4, isActive: 1 },
      ],
    };
  }

  load(): void {
    this.loading = true;
    this.api.search(this.filter)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.data = res && res.items && res.items.length > 0 ? res : this.getMockData();
        },
        error: () => {
          this.data = this.getMockData();
        },
      });
  }

  onSearch(filter: GroupCategoryFilter): void {
    this.filter = filter;
    this.load();
  }

  onPageChange(page: number): void {
    this.filter = { ...this.filter, page };
    this.load();
  }

  onSelectionChange(ids: Set<number>): void {
    this.selectedIds = ids;
  }

  onRowDoubleClick(row: GroupCategory): void {
    this.openDetail(row);
  }

  onAddNew(): void {
    this.formMode = 'create';
    this.formSource = null;
    this.formDialogVisible = true;
  }

  openEdit(row: GroupCategory): void {
    this.formMode = 'edit';
    this.formSource = row;
    this.formDialogVisible = true;
  }

  openCopy(row: GroupCategory): void {
    this.formMode = 'copy';
    this.formSource = row;
    this.formDialogVisible = true;
  }

  openDetail(row: GroupCategory): void {
    this.selectedRecord = row;
    this.detailDiff = {
      oldData: null,
      newData: {
        paramName: row.paramName,
        paramValue: row.paramValue,
        paramType: row.paramType,
        componentCode: row.componentCode,
        description: row.description,
        effectiveDate: row.effectiveDate,
        endEffectiveDate: row.endEffectiveDate,
      },
      changedFields: [],
    };
    this.detailDialogVisible = true;
  }

  onFormSaved(result: GroupCategory | null): void {
    this.formDialogVisible = false;
    if (!result) return;

    const items = [...(this.data?.items ?? [])];
    const index = items.findIndex((item: GroupCategory) => item.id === result.id);

    if (index >= 0) {
      items[index] = result;
    } else {
      items.unshift({ ...result, id: Date.now() });
    }

    this.data = { ...this.data, total: items.length, items };
    this.selectedRecord = result;
    this.detailDiff = {
      oldData: null,
      newData: {
        paramName: result.paramName,
        paramValue: result.paramValue,
        paramType: result.paramType,
        componentCode: result.componentCode,
        description: result.description,
        effectiveDate: result.effectiveDate,
        endEffectiveDate: result.endEffectiveDate,
      },
      changedFields: [],
    };
    this.detailDialogVisible = true;
  }

  onDetailAction(action: 'approve' | 'reject' | 'submit' | 'cancel' | 'delete' | null): void {
    if (!action) {
      this.detailDialogVisible = false;
      this.selectedRecord = null;
      return;
    }

    if (action === 'approve') {
      this.pendingConfirmAction = 'approve';
      this.confirmTitle = 'Phê duyệt';
      this.confirmMessage = 'Bạn có chắc chắn phê duyệt bản ghi này?';
      this.confirmDialogVisible = true;
      return;
    }

    if (action === 'reject') {
      this.rejectDialogVisible = true;
      return;
    }

    if (action === 'submit') {
      this.pendingConfirmAction = 'submit';
      this.confirmTitle = 'Gửi duyệt';
      this.confirmMessage = 'Bạn có chắc chắn gửi duyệt bản ghi này?';
      this.confirmDialogVisible = true;
      return;
    }

    if (action === 'cancel') {
      this.pendingConfirmAction = 'cancel';
      this.confirmTitle = 'Hủy phê duyệt';
      this.confirmMessage = 'Bạn chắc chắn muốn hủy duyệt bản ghi này?';
      this.confirmDialogVisible = true;
      return;
    }

    if (action === 'delete') {
      this.pendingConfirmAction = 'delete';
      this.confirmTitle = 'Xóa bản ghi';
      this.confirmMessage = 'Bạn có chắc chắn xóa bản ghi này không?';
      this.confirmDialogVisible = true;
    }
  }

  onConfirmResult(confirmed: boolean): void {
    this.confirmDialogVisible = false;
    if (!confirmed || !this.selectedRecord) return;

    const record = { ...this.selectedRecord };

    switch (this.pendingConfirmAction) {
      case 'submit':
        record.status = ParamStatus.PENDING;
        break;
      case 'approve':
        record.status = ParamStatus.APPROVED;
        break;
      case 'cancel':
        record.status = ParamStatus.CANCELLED;
        break;
      case 'delete':
        this.data = {
          ...this.data,
          items: (this.data?.items ?? []).filter((item: GroupCategory) => item.id !== record.id),
          total: (this.data?.items ?? []).filter((item: GroupCategory) => item.id !== record.id).length,
        };
        this.detailDialogVisible = false;
        this.selectedRecord = null;
        this.pendingConfirmAction = null;
        return;
      default:
        break;
    }

    this.data = {
      ...this.data,
      items: (this.data?.items ?? []).map((item: GroupCategory) => item.id === record.id ? record : item),
    };
    this.selectedRecord = record;
    this.pendingConfirmAction = null;
  }

  onReasonSubmitted(reason: string | null): void {
    this.rejectDialogVisible = false;
    if (!reason || !this.selectedRecord) return;

    const record = { ...this.selectedRecord, status: ParamStatus.REJECTED, rejectReason: reason };
    this.data = {
      ...this.data,
      items: (this.data?.items ?? []).map((item: GroupCategory) => item.id === record.id ? record : item),
    };
    this.selectedRecord = record;
  }

  getFirstSelectedId(): number {
    return this.selectedIds.size ? [...this.selectedIds][0] : 1;
  }

  openHistory(id: number): void {
    this.historyId = id;
    this.historyDialogVisible = true;
  }

  onExport(): void {
    console.log('Export Excel');
  }
}
