import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCategoryNavigationService, NavigationState } from '../../services/navigation.service';
import { HistoryDialogComponent } from '../../components/history-dialog/history-dialog';

@Component({
  selector: 'app-group-category-history-page',
  templateUrl: './historypage.component.html',
  standalone: true,
  imports: [CommonModule, HistoryDialogComponent],
})
export class GroupCategoryHistoryPageComponent implements OnInit {
  historyId = 0;
  navigationState: NavigationState | null = null;

  constructor(private readonly navigationService: GroupCategoryNavigationService) {}

  ngOnInit(): void {
    this.navigationService.navigation$.subscribe((state: NavigationState) => {
      this.navigationState = state;
      if (state.mode === 'history') {
        this.historyId = state.historyId || 0;
      }
    });
  }

  onClose(): void {
    this.navigationService.navigateToList();
  }

  onBack(): void {
    this.navigationService.navigateToList();
  }


  
  
}
