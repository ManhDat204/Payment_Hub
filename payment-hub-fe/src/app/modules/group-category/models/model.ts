// models/group-category.model.ts
import { ParamStatus, IsActive, IsDisplay } from './status.enum';

export interface GroupCategoryDraftData {
  action?: 'UPDATE' | 'CANCEL_APPROVAL' | string;
  paramName?: string | null;
  paramValue?: string | null;
  paramType?: string | null;
  description?: string | null;
  componentCode?: string | null;
  isActive?: IsActive | null;
  effectiveDate?: string | null;
  endEffectiveDate?: string | null;
}

export interface GroupCategory {
  id: number;
  paramName: string;              // PARAM_NAME - Tên thành phần (bắt buộc)
  paramValue: string;             // PARAM_VALUE - Giá trị thành phần (bắt buộc)
  paramType: string;              // PARAM_TYPE - Danh mục theo nhóm (bắt buộc)
  description?: string;           // DESCRIPTION - Mô tả (không bắt buộc)
  componentCode: string;          // COMPONENT_CODE - Cấu phần xử lý (bắt buộc)
  status: ParamStatus;            // STATUS - 1=Mới, 3=Chờ duyệt, 4=Đã duyệt, 5=Từ chối, 7=Hủy duyệt
  isActive: IsActive;             // IS_ACTIVE - 0=Không hoạt động, 1=Hoạt động
  isDisplay?: IsDisplay;          // IS_DISPLAY - 1=Chưa duyệt, 2=Đã duyệt (chỉ logic FE, không hiển thị)
  newData?: string | GroupCategoryDraftData | null; // NEW_DATA - dữ liệu mới chờ duyệt
  effectiveDate: string;          // EFFECTIVE_DATE - Ngày hiệu lực (ISO, bắt buộc)
  endEffectiveDate?: string;      // END_EFFECTIVE_DATE - Ngày hết hiệu lực (ISO)
  createdBy?: string;             // Người tạo
  createdDate?: string;           // Ngày tạo
  updatedBy?: string;             // Người cập nhật
  updatedDate?: string;           // Ngày cập nhật
  approvedBy?: string;            // Người duyệt
  approvedDate?: string;          // Ngày duyệt
  rejectReason?: string;          // Lý do từ chối
}

// Dữ liệu form thêm/sửa (chưa có id/status)
export interface GroupCategoryFormValue {
  paramName: string;              // Tên thành phần (bắt buộc)
  paramValue: string;             // Giá trị thành phần (bắt buộc)
  paramType: string;              // Danh mục theo nhóm (bắt buộc)
  componentCode: string;          // Cấu phần xử lý (bắt buộc)
  effectiveDate: string;          // Ngày hiệu lực (bắt buộc)
  description?: string;           // Mô tả
  endEffectiveDate?: string | null; // Ngày hết hiệu lực
  isActive?: IsActive;            // Trạng thái hoạt động
}


export interface GroupCategoryDiff {
  status: ParamStatus;            // Trạng thái hiện tại
  oldData: Partial<GroupCategoryFormValue> | null; // Dữ liệu cũ (null nếu là bản ghi mới)
  newData: Partial<GroupCategoryFormValue>; // Dữ liệu mới
  changedFields: (keyof GroupCategoryFormValue)[]; // Các trường thay đổi (để highlight)
}

// Cấu phần xử lý (dropdown option)
export interface ComponentOption {
  componentCode: string;          // Mã cấu phần
  componentName: string;          // Tên cấu phần
}

// Lịch sử thao tác
export interface HistoryLog {
  id?: number;
  userId: string;                 // ID người thực hiện
  userName: string;               // Tên người thực hiện
  action: string;                 // Thao tác: Thêm mới, Sửa, Gửi duyệt, Phê duyệt, Từ chối, Hủy phê duyệt
  actionAt: string;               // Thời gian thực hiện
  ip: string;                     // Địa chỉ IP
  content: string;                // Chi tiết nội dung thao tác
}
