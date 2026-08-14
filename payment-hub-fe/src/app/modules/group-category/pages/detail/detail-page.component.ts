import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCategoryNavigationService, NavigationState } from '../../services/navigation.service';
import { GroupCategory } from '../../models/model';
import { DetailDialogComponent } from '../../components/detail-dialog/detail-dialog';

@Component({
  selector: 'app-group-category-detail-page',
  templateUrl: './detailpage.component.html',
  styleUrls: ['./detailpage.component.css'],
  standalone: true,
  imports: [CommonModule, DetailDialogComponent],
})
export class GroupCategoryDetailPageComponent implements OnInit {
  record: GroupCategory | null = null;
  diff: any = null;
  navigationState: NavigationState | null = null;

  constructor(private readonly navigationService: GroupCategoryNavigationService) {}

  ngOnInit(): void {
    this.navigationService.navigation$.subscribe((state: NavigationState) => {
      this.navigationState = state;
      if (state.mode === 'detail') {
        this.record = state.record || null;
        this.diff = state.diff || null;
      }
    });
  }

  onAction(action: 'approve' | 'reject' | 'submit' | 'cancel' | 'delete' | null): void {
    // Xử lý action từ detail dialog
    if (!action) {
      // Close/cancel action
      this.navigationService.navigateToList();
      return;
    }

    // Các logic xử lý action khác sẽ được xử lý bởi action pages (approve, reject, etc.)
    if (action === 'approve') {
      this.navigationService.navigateToApprove(this.record!);
    } else if (action === 'reject') {
      this.navigationService.navigateToReject(this.record!);
    } else if (action === 'submit') {
      // Có thể handle submit tại đây hoặc tạo một page riêng
      this.navigationService.navigateToList();
    } else if (action === 'cancel') {
      this.navigationService.navigateToList();
    } else if (action === 'delete') {
      this.navigationService.navigateToList();
    }
  }

  onBack(): void {
    this.navigationService.navigateToList();
  }
}
