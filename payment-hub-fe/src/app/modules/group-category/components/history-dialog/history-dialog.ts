import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiTableTbody, TuiTableTd, TuiTableTh, TuiTableThGroup, TuiTableTr, TuiTable } from '@taiga-ui/addon-table';
import { TuiPagination } from '@taiga-ui/kit';
import { GroupCategoryApiService, PagedResult } from '../../services/api.service';
import { HistoryLog } from '../../models/model';

@Component({
  selector: 'app-group-category-history-dialog',
  templateUrl: './history-dialog.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, TuiTable, TuiTableThGroup, TuiTableTh, TuiTableTbody, TuiTableTr, TuiTableTd, TuiPagination],
})
export class HistoryDialogComponent implements OnInit {
  @Input() id: number = 0;
  data: PagedResult<HistoryLog> | null = null;
  page = 1;
  pageSize = 10;

  constructor(private readonly api: GroupCategoryApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getHistory(this.id, this.page, this.pageSize)
      .subscribe((res) => (this.data = res));
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }
}