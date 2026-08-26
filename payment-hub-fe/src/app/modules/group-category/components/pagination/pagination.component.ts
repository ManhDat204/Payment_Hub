import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

type PaginationItem = number | 'ellipsis';

@Component({
  selector: 'app-group-category-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCategoryPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 0;

  @Output() pageChange = new EventEmitter<number>();

  get items(): PaginationItem[] {
    const total = Math.max(this.totalPages, 0);
    const current = this.normalizePage(this.currentPage);

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis', total];
    }

    if (current >= total - 3) {
      return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
  }

  isPage(item: PaginationItem): item is number {
    return typeof item === 'number';
  }

  goTo(page: number): void {
    const nextPage = this.normalizePage(page);
    if (nextPage === this.normalizePage(this.currentPage)) {
      return;
    }

    this.pageChange.emit(nextPage);
  }

  goToItem(item: PaginationItem): void {
    if (this.isPage(item)) {
      this.goTo(item);
    }
  }

  trackByItem(index: number, item: PaginationItem): string {
    return `${item}-${index}`;
  }

  private normalizePage(page: number): number {
    const total = Math.max(this.totalPages, 1);
    return Math.min(Math.max(page, 1), total);
  }
}
