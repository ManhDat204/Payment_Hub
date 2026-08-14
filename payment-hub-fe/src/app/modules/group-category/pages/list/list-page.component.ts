import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { GroupCategoryApiService } from '../../services/api.service';
import { GroupCategoryNavigationService } from '../../services/navigation.service';
import { GroupCategoryFilter } from '../../models/filter.model';
import { GroupCategory } from '../../models/model';
import { SearchFilterComponent } from '../../components/search-filter/search-filter';
import { DataGridComponent } from '../../components/data-grid/data-grid';

@Component({
  selector: 'app-group-category-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css'],
  standalone: true,
  imports: [SearchFilterComponent, DataGridComponent, CommonModule],
})
export class GroupCategoryListPageComponent implements OnInit {
  filter: GroupCategoryFilter = { page: 1, pageSize: 20 };
  data: any = null;
  loading = false;
  selectedIds = new Set<number>();

  constructor(
    private readonly api: GroupCategoryApiService,
    private readonly navigationService: GroupCategoryNavigationService
  ) {}

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
        {
          id: 1,
          paramType: 'ROAD',
          paramValue: 'TS_REALTIME',
          paramName: 'Biểu chính hàng tin',
          description: 'Mô tả giá trị realtime',
          componentCode: 'IFRT',
          effectiveDate: '2025-04-05',
          endEffectiveDate: '2025-04-15',
          status: 4,
          isActive: 1,
        },
        {
          id: 2,
          paramType: 'ROAD',
          paramValue: 'CRP_HDL',
          paramName: 'Khối xử lý báo cáo',
          description: 'Danh mục cấu hình báo cáo',
          componentCode: 'CRP',
          effectiveDate: '2025-04-06',
          endEffectiveDate: '2025-04-20',
          status: 3,
          isActive: 1,
        },
        {
          id: 3,
          paramType: 'ROAD',
          paramValue: 'PAY_LINK',
          paramName: 'Liên kết thanh toán',
          description: 'Dạng link thanh toán',
          componentCode: 'PAY',
          effectiveDate: '2025-04-07',
          endEffectiveDate: '2025-04-25',
          status: 1,
          isActive: 0,
        },
        {
          id: 4,
          paramType: 'BILL',
          paramValue: 'BILL_PERIOD',
          paramName: 'Chu kỳ hoá đơn',
          description: 'Xác định chu kỳ',
          componentCode: 'BILL',
          effectiveDate: '2025-04-08',
          endEffectiveDate: '2025-04-26',
          status: 5,
          isActive: 0,
        },
        {
          id: 5,
          paramType: 'CHANNEL',
          paramValue: 'SMS_GATE',
          paramName: 'Gateway SMS',
          description: 'Cổng gửi SMS',
          componentCode: 'SMS',
          effectiveDate: '2025-04-09',
          endEffectiveDate: '2025-04-27',
          status: 7,
          isActive: 1,
        },
        {
          id: 6,
          paramType: 'CHANNEL',
          paramValue: 'EMAIL_GATE',
          paramName: 'Gateway Email',
          description: 'Cổng gửi email',
          componentCode: 'MAIL',
          effectiveDate: '2025-04-10',
          endEffectiveDate: '2025-04-30',
          status: 4,
          isActive: 1,
        },
      ],
    };
  }

  load(): void {
    this.loading = true;
    this.api
      .search(this.filter)
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
    this.navigationService.navigateToAdd();
  }

  openEdit(row: GroupCategory): void {
    this.navigationService.navigateToEdit(row);
  }

  openCopy(row: GroupCategory): void {
    this.navigationService.navigateToCopy(row);
  }

  openDetail(row: GroupCategory): void {
    this.navigationService.navigateToDetail(row, {
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
    });
  }

  onExport(): void {
    console.log('Export Excel');
  }
}
