// services/group-category-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import {
  GroupCategory, GroupCategoryFormValue, GroupCategoryDiff,
  ComponentOption, HistoryLog,
} from '../models/model';
import { GroupCategoryFilter } from '../models/filter.model';

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

const BASE_URL = '/api/group-categories/jpa';

@Injectable({ providedIn: 'root' })
export class GroupCategoryApiService {
  constructor(private readonly http: HttpClient) {}

  /** 1.1/1.2 - Tìm kiếm + phân trang lưới hiển thị */
  search(filter: GroupCategoryFilter): Observable<PagedResult<GroupCategory>> {
    let params = new HttpParams()
      .set('page', filter.page - 1) // Backend uses 0-based page
      .set('size', filter.pageSize);
    if (filter.paramType) params = params.set('paramType', filter.paramType);
    if (filter.paramValue) params = params.set('paramValue', filter.paramValue);
    if (filter.paramName) params = params.set('paramName', filter.paramName);
    if (filter.statuses?.length) params = params.set('statuses', filter.statuses.join(','));
    if (filter.isActiveList?.length) params = params.set('activeStatuses', filter.isActiveList.join(','));
    if (filter.sortField) params = params.set('sortField', filter.sortField).set('sortOrder', filter.sortOrder ?? 'DESC');
    return this.http.get<PagedResult<GroupCategory>>(BASE_URL, { params });
  }

  /** Xem chi tiết 1 bản ghi */
  getDetail(id: number): Observable<GroupCategory> {
    return this.http.get<GroupCategory>(`${BASE_URL}/${id}`);
  }

  /** Thêm mới / Sao chép — Lưu nháp (status = Mới) */
  create(payload: GroupCategoryFormValue): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(BASE_URL, payload);
  }

  /** Thêm mới — Lưu và gửi duyệt luôn (status = Chờ duyệt) */
  createAndSubmit(payload: GroupCategoryFormValue): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(`${BASE_URL}/save-and-submit`, payload);
  }

  /** Sửa — Lưu nháp */
  update(id: number, payload: GroupCategoryFormValue): Observable<GroupCategory> {
    return this.http.put<GroupCategory>(`${BASE_URL}/${id}`, payload);
  }

  /** Sửa — Lưu và gửi duyệt */
  updateAndSubmit(id: number, payload: GroupCategoryFormValue): Observable<GroupCategory> {
    return this.update(id, payload).pipe(switchMap((updated) => this.submit(updated.id)));
  }

  /** Xóa (chỉ khi is_display = 1, tức chưa từng được duyệt) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }

  /** Xóa batch */
  deleteBatch(ids: number[]): Observable<void> {
    return this.http.post<void>(`${BASE_URL}/delete`, { ids });
  }

  /** Gửi duyệt 1 bản ghi đã lưu nháp / bị từ chối */
  submit(id: number): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(`${BASE_URL}/${id}/submit`, {});
  }

  /** Gửi duyệt batch */
  submitBatch(ids: number[]): Observable<GroupCategory[]> {
    return this.http.post<GroupCategory[]>(`${BASE_URL}/submit`, { ids });
  }

  /** Phê duyệt 1 bản ghi */
  approve(id: number): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(`${BASE_URL}/${id}/approve`, {});
  }

  /** Phê duyệt batch */
  approveBatch(ids: number[]): Observable<GroupCategory[]> {
    return this.http.post<GroupCategory[]>(`${BASE_URL}/approve`, { ids });
  }

  /** Từ chối duyệt 1 bản ghi (kèm lý do) */
  reject(id: number, reason: string): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(`${BASE_URL}/${id}/reject`, { reason });
  }

  /** Từ chối duyệt batch (kèm lý do) */
  rejectBatch(ids: number[], reason: string): Observable<GroupCategory[]> {
    return this.http.post<GroupCategory[]>(`${BASE_URL}/reject`, { ids, reason });
  }

  /** Hủy duyệt 1 bản ghi đã Đã duyệt */
  cancelApproval(id: number): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(`${BASE_URL}/${id}/cancel-approval`, {});
  }

  /** Hủy duyệt batch */
  cancelApprovalBatch(ids: number[]): Observable<GroupCategory[]> {
    return this.http.post<GroupCategory[]>(`${BASE_URL}/cancel-approval`, { ids });
  }

  /** Dropdown Cấu phần xử lý — tham chiếu PMH_COMPONENTS, IS_ACTIVE = 1 */
  getComponentOptions(): Observable<ComponentOption[]> {
    return this.http.get<ComponentOption[]>(`${BASE_URL}/components/active`);
  }

  /** Lịch sử thao tác (phân trang) */
  getHistory(id: number, page: number, pageSize: number): Observable<PagedResult<HistoryLog>> {
    const params = new HttpParams().set('page', page - 1).set('size', pageSize);
    return this.http.get<PagedResult<HistoryLog>>(`${BASE_URL}/${id}/history`, { params });
  }

  /** Xuất Excel theo bộ lọc hiện tại */
  exportExcel(filter: GroupCategoryFilter): Observable<Blob> {
    let params = new HttpParams();
    if (filter.paramType) params = params.set('paramType', filter.paramType);
    if (filter.paramValue) params = params.set('paramValue', filter.paramValue);
    if (filter.paramName) params = params.set('paramName', filter.paramName);
    if (filter.statuses?.length) params = params.set('statuses', filter.statuses.join(','));
    if (filter.isActiveList?.length) params = params.set('activeStatuses', filter.isActiveList.join(','));
    return this.http.get(`${BASE_URL}/export`, { params, responseType: 'blob' });
  }

  /** Kiểm tra trùng (Tên thành phần + Giá trị thành phần + Danh mục theo nhóm) */
  checkDuplicate(paramType: string, paramValue: string, excludeId?: number): Observable<{ duplicated: boolean }> {
    let params = new HttpParams().set('paramType', paramType).set('paramValue', paramValue);
    if (excludeId) params = params.set('excludeId', excludeId);
    return this.http.get<{ duplicated: boolean }>(`${BASE_URL}/check-duplicate`, { params });
  }
}
