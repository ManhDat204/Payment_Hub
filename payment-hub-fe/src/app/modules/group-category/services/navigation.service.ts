import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupCategory } from '../models/model';

export type PageMode = 'list' | 'add' | 'edit' | 'copy' | 'detail' | 'approve' | 'reject' | 'history';

export interface NavigationState {
  mode: PageMode;
  record?: GroupCategory | null;
  historyId?: number;
  rejectReason?: string | null;
  diff?: any;
  selectedIds?: Set<number>;
}

@Injectable({
  providedIn: 'root',
})
export class GroupCategoryNavigationService {
  private navigationSubject = new BehaviorSubject<NavigationState>({
    mode: 'list',
    record: null,
    selectedIds: new Set(),
  });

  navigation$: Observable<NavigationState> = this.navigationSubject.asObservable();

  constructor(private router: Router) {}

  getCurrentState(): NavigationState {
    return this.navigationSubject.value;
  }

  navigateToList(selectedIds?: Set<number>): void {
    console.log('🔵 NavigationService.navigateToList() called');
    console.trace('🔍 Call stack:');
    this.navigationSubject.next({
      mode: 'list',
      selectedIds: selectedIds || new Set(),
    });
  }

  navigateToAdd(): void {
    this.navigationSubject.next({
      mode: 'add',
      record: null,
    });
  }

  navigateToEdit(record: GroupCategory): void {
    this.navigationSubject.next({
      mode: 'edit',
      record,
    });
  }

  navigateToCopy(record: GroupCategory): void {
    this.navigationSubject.next({
      mode: 'copy',
      record,
    });
  }

  navigateToDetail(record: GroupCategory, diff?: any): void {
    this.navigationSubject.next({
      mode: 'detail',
      record,
      diff,
    });
  }

  navigateToApprove(record: GroupCategory): void {
    this.navigationSubject.next({
      mode: 'approve',
      record,
    });
  }

  navigateToReject(record: GroupCategory): void {
    this.navigationSubject.next({
      mode: 'reject',
      record,
    });
  }

  navigateToHistory(id: number): void {
    this.navigationSubject.next({
      mode: 'history',
      historyId: id,
    });
  }
}
