// models/group-category-status.enum.ts
export enum ParamStatus {
  NEW = 1,           // Mới
  PENDING = 3,       // Chờ duyệt
  APPROVED = 4,      // Đã duyệt
  REJECTED = 5,      // Từ chối
  CANCELLED = 7,     // Hủy duyệt
}

export const ParamStatusLabel: Record<ParamStatus, string> = {
  [ParamStatus.NEW]: 'Mới',
  [ParamStatus.PENDING]: 'Chờ duyệt',
  [ParamStatus.APPROVED]: 'Đã duyệt',
  [ParamStatus.REJECTED]: 'Từ chối',
  [ParamStatus.CANCELLED]: 'Hủy duyệt',
};

export enum IsActive {
  INACTIVE = 0,
  ACTIVE = 1,
}

export const IsActiveLabel: Record<IsActive, string> = {
  [IsActive.INACTIVE]: 'Không hoạt động',
  [IsActive.ACTIVE]: 'Hoạt động',
};

export enum IsDisplay {
  NOT_APPROVED = 1,  // Chưa duyệt
  APPROVED = 2,      // Đã duyệt
}

export const IsDisplayLabel: Record<IsDisplay, string> = {
  [IsDisplay.NOT_APPROVED]: 'Chưa duyệt',
  [IsDisplay.APPROVED]: 'Đã duyệt',
};