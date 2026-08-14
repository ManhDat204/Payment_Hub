// models/group-category-filter.model.ts
import { ParamStatus, IsActive } from './status.enum';

export interface GroupCategoryFilter {
  paramType?: string;      
  paramValue?: string;     
  paramName?: string;      
  statuses?: ParamStatus[];   
  isActiveList?: IsActive[];  
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}