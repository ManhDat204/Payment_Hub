import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupCategoryFilter } from '../models/filter.model';

interface StoreState {
  searchParams: GroupCategoryFilter;
  currentPage: number;
  selectedIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class GroupCategoryStoreService {
  private readonly initialState: StoreState = {
    searchParams: { page: 1, pageSize: 20 },
    currentPage: 1,
    selectedIds: []
  };

  private state$ = new BehaviorSubject<StoreState>(this.initialState);

  constructor() {}


  getState(): Observable<StoreState> {
    return this.state$.asObservable();
  }


  getSearchParams(): GroupCategoryFilter {
    return this.state$.value.searchParams;
  }

  setSearchParams(params: GroupCategoryFilter): void {
    const state = this.state$.value;
    this.state$.next({
      ...state,
      searchParams: params
    });
  }


  clearSearchParams(): void {
    const state = this.state$.value;
    this.state$.next({
      ...state,
      searchParams: { page: 1, pageSize: 20 }
    });
  }

  /**
   * Get current page number
   */
  getCurrentPage(): number {
    return this.state$.value.currentPage;
  }

  /**
   * Set current page number
   */
  setCurrentPage(page: number): void {
    const state = this.state$.value;
    this.state$.next({
      ...state,
      currentPage: page
    });
  }

  /**
   * Get selected item IDs
   */
  getSelectedIds(): number[] {
    return this.state$.value.selectedIds;
  }

  /**
   * Set selected item IDs
   */
  setSelectedIds(ids: number[]): void {
    const state = this.state$.value;
    this.state$.next({
      ...state,
      selectedIds: ids
    });
  }

  /**
   * Add item ID to selection
   */
  addSelectedId(id: number): void {
    const state = this.state$.value;
    if (!state.selectedIds.includes(id)) {
      this.state$.next({
        ...state,
        selectedIds: [...state.selectedIds, id]
      });
    }
  }

  /**
   * Remove item ID from selection
   */
  removeSelectedId(id: number): void {
    const state = this.state$.value;
    this.state$.next({
      ...state,
      selectedIds: state.selectedIds.filter(selectedId => selectedId !== id)
    });
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    const state = this.state$.value;
    this.state$.next({
      ...state,
      selectedIds: []
    });
  }

  /**
   * Reset store to initial state
   */
  resetStore(): void {
    this.state$.next(this.initialState);
  }
}
