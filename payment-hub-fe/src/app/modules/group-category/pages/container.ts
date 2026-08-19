import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GroupCategoryNavigationService, PageMode, NavigationState } from '../services/navigation.service';
import { GroupCategoryListPageComponent } from './list/list-page.component';
import { GroupCategoryAddPageComponent } from './add/add-page';
import { GroupCategoryDetailPageComponent } from './detail/detail-page.component';
import { GroupCategoryApprovePageComponent } from './approve/approve-page';
import { GroupCategoryHistoryPageComponent } from './history/historypage.component';

@Component({
  selector: 'app-container',
  templateUrl: './container.html',
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
export class GroupCategoryContainerComponent implements OnInit, OnDestroy {
  currentMode: PageMode = 'list';
  private subscription?: Subscription;

  constructor(
    private readonly navigationService: GroupCategoryNavigationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.navigationService.navigation$.subscribe((state: NavigationState) => {
      this.currentMode = state.mode;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  isCurrentMode(mode: PageMode): boolean {
    return this.currentMode === mode;
  }
}
