
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
  paramName: string;              
  paramValue: string;            
  paramType: string;             
  description?: string;           
  componentCode: string;          
  status: ParamStatus;            
  isActive: IsActive;             
  isDisplay?: IsDisplay;          
  newData?: string | GroupCategoryDraftData | null; 
  effectiveDate: string;          
  endEffectiveDate?: string;    
  createdBy?: string;          
  createdDate?: string;           
  updatedBy?: string;            
  updatedDate?: string;         
  approvedBy?: string;            
  approvedDate?: string;      
  rejectReason?: string;         
}


export interface GroupCategoryFormValue {
  paramName: string;              
  paramValue: string;            
  paramType: string;             
  componentCode: string;          
  effectiveDate: string;         
  description?: string;          
  endEffectiveDate?: string | null;
  isActive?: IsActive;           
}


export interface GroupCategoryDiff {
  status: ParamStatus;            
  oldData: Partial<GroupCategoryFormValue> | null;
  newData: Partial<GroupCategoryFormValue>; 
  changedFields: (keyof GroupCategoryFormValue)[];
}

export interface ComponentOption {
  componentCode: string;          
  componentName: string;        
}

// Lịch sử thao tác
export interface HistoryLog {
  id: number;
  actionBy: string;
  actionTime: string | null;
  actionType: string;
  description: string;
  ip: string;
  objectId: number;
  objectType: string;
  oldData: string | null;
  newData: string | null;
}
