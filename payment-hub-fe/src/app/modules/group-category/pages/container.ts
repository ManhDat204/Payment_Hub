import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCategoryNavigationService, PageMode, NavigationState } from '../services/navigation.service';
import { GroupCategoryListPageComponent } from './list/list-page.component';
import { GroupCategoryAddPageComponent } from './add/add-page';
import { GroupCategoryDetailPageComponent } from './detail/detail-page.component';
import { GroupCategoryApprovePageComponent } from './approve/approve-page';
import { GroupCategoryHistoryPageComponent } from './history/historypage.component';

@Component({
  selector: 'app-container',
  templateUrl: './container.html',
  styleUrls: ['./container.css'],
  standalone: true,
  imports: [
    CommonModule,
    GroupCategoryListPageComponent,
    GroupCategoryAddPageComponent,
    GroupCategoryDetailPageComponent,
    GroupCategoryApprovePageComponent,
    GroupCategoryHistoryPageComponent,
  ],
})
export class GroupCategoryContainerComponent implements OnInit {
  currentMode: PageMode = 'list';

  constructor(private readonly navigationService: GroupCategoryNavigationService) {}

  ngOnInit(): void {
    this.navigationService.navigation$.subscribe((state: NavigationState) => {
      this.currentMode = state.mode;
    });
  }

  isCurrentMode(mode: PageMode): boolean {
    return this.currentMode === mode;
  }
}
