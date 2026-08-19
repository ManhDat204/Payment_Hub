import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { GroupCategoryNavigationService, NavigationState } from '../../services/navigation.service';
import { GroupCategoryApiService } from '../../services/api.service';
import { GroupCategory, GroupCategoryFormValue } from '../../models/model';
import { ParamStatus } from '../../models/status.enum';
import { ToastService } from '../../../../core/services/toast.service';


function noPastDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const inputDate = new Date(control.value);
  const now = new Date();
  
  if (inputDate < now) {
    return { pastDate: true };
  }
  return null;
}

function effectiveDateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const effectiveDate = control.get('effectiveDate')?.value;
  const endEffectiveDate = control.get('endEffectiveDate')?.value;

  if (!effectiveDate || !endEffectiveDate) {
    return null;
  }

  return new Date(endEffectiveDate) < new Date(effectiveDate)
    ? { endBeforeEffective: true }
    : null;
}

@Component({
  selector: 'app-group-category-add-page',
  templateUrl: './add-page.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule],
})
export class GroupCategoryAddPageComponent implements OnInit {
  mode: 'create' | 'edit' | 'copy' = 'create';
  source: GroupCategory | null = null;
  navigationState: NavigationState | null = null;
  pageTitle = 'Thêm mới tham số danh mục theo nhóm';
  breadcrumbLast = 'Thêm mới';
  saving = false;
  form: FormGroup;
  componentOptions: any[] = [];

  constructor(
    private readonly navigationService: GroupCategoryNavigationService,
    private readonly api: GroupCategoryApiService,
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService
  ) {
    this.form = this.fb.group({
      paramName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      paramValue: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      paramType: ['', [Validators.required, Validators.maxLength(255)]],
      componentCode: ['', Validators.required],
      description: ['', Validators.maxLength(4000)],
      effectiveDate: ['', [Validators.required, noPastDateValidator]],
      endEffectiveDate: ['', [noPastDateValidator]]
    }, { validators: effectiveDateRangeValidator });
  }

  ngOnInit(): void {
    this.loadComponentOptions();
    
    this.navigationService.navigation$.subscribe((state) => {
      this.navigationState = state;

      if (state.mode === 'add') {
        this.mode = 'create';
        this.source = null;
        this.pageTitle = 'Thêm mới tham số danh mục theo nhóm';
        this.breadcrumbLast = 'Thêm mới';
        this.form.get('paramType')?.enable();
        this.form.reset(this.emptyFormValue());
      } else if (state.mode === 'edit') {
        this.mode = 'edit';
        this.source = state.record || null;
        this.pageTitle = 'Sửa tham số danh mục theo nhóm';
        this.breadcrumbLast = 'Sửa';
        if (this.source) {
          if (this.source.status === ParamStatus.APPROVED) {
            this.toastService.info('Bản ghi đã phê duyệt không thể cập nhật');
            this.navigationService.navigateToList();
            return;
          }

          this.patchFormFromSource(this.source);
          this.form.get('paramType')?.disable();
        }
      } else if (state.mode === 'copy') {
        this.mode = 'copy';
        this.source = state.record || null;
        this.pageTitle = 'Thêm mới tham số danh mục theo nhóm';
        this.breadcrumbLast = 'Sao chép';
        this.form.get('paramType')?.enable();
        if (this.source) {
          this.patchFormFromSource(this.source, true);
        }
      }
    });
  }

  private emptyFormValue(): GroupCategoryFormValue {
    return {
      paramName: '',
      paramValue: '',
      paramType: '',
      componentCode: '',
      description: '',
      effectiveDate: '',
      endEffectiveDate: ''
    };
  }

  private patchFormFromSource(source: GroupCategory, copy = false): void {
    this.form.reset({
      paramName: source.paramName,
      paramValue: copy ? `${source.paramValue}_copy` : source.paramValue,
      paramType: source.paramType,
      componentCode: source.componentCode,
      description: source.description ?? '',
      effectiveDate: this.toDateTimeLocal(source.effectiveDate),
      endEffectiveDate: this.toDateTimeLocal(source.endEffectiveDate)
    });
  }

  private toDateTimeLocal(value?: string | null): string {
    return value ? value.slice(0, 16) : '';
  }

  private loadComponentOptions(): void {
    this.api.getComponentOptions().subscribe({
      next: (options) => {
        this.componentOptions = options;
      },
      error: () => {
        this.componentOptions = [
          { componentCode: 'TRA', componentName: 'TRA - Trạng thái xử lý' },
          { componentCode: 'IFRT', componentName: 'IFRT - International Fund Transfer' },
          { componentCode: 'CRP', componentName: 'CRP - Corporate Payment' },
          { componentCode: 'RETAIL', componentName: 'RETAIL - Retail Payment' },
        ];
      }
    });
  }

  save(): void {
    console.log('🔵 Save clicked, form valid:', this.form.valid);

    if (this.isApprovedUpdateBlocked()) {
      return;
    }
    
    if (!this.form.valid) {
      console.log('❌ Form invalid');
      this.form.markAllAsTouched();
      this.toastService.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    console.log('✅ Form valid, calling API...');
    this.saving = true;
    const formValue = this.form.getRawValue() as GroupCategoryFormValue;
    
    let apiCall;
    if (this.mode === 'create' || this.mode === 'copy') {
      apiCall = this.api.create(formValue);
    } else {
      apiCall = this.api.update(this.source!.id, formValue);
    }

    apiCall.subscribe({
      next: () => {
        console.log('✅ Save success, redirecting...');
        this.saving = false;
        this.toastService.success(this.successMessage(false));
        // Redirect ngay lập tức, toast sẽ hiển thị trên list page
        this.navigationService.navigateToList();
      },
      error: (error) => {
        console.error('❌ Save error:', error);
        this.saving = false;
        
        let errorMsg = 'Lỗi lưu dữ liệu';
        
        if (error.error?.message) {
          const msg = error.error.message;
          if (msg.includes('unique constraint') || msg.includes('ORA-00001')) {
            errorMsg = 'Dữ liệu đã tồn tại. Vui lòng kiểm tra lại giá trị thành phần hoặc tên thành phần.';
          } else if (msg.includes('ORA-')) {
            errorMsg = 'Lỗi cơ sở dữ liệu. Vui lòng kiểm tra lại thông tin nhập.';
          } else {
            errorMsg = msg;
          }
        } else if (error.status === 403) {
          errorMsg = 'Bạn không có quyền thực hiện thao tác này';
        } else if (error.status === 401) {
          errorMsg = 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại';
        } else if (error.status === 500) {
          errorMsg = 'Lỗi hệ thống. Vui lòng thử lại sau';
        }
        
        console.log('🔴 Showing error toast:', errorMsg);
        this.toastService.error(errorMsg);
      }
    });
  }

  saveAndSubmit(): void {
    if (this.isApprovedUpdateBlocked()) {
      return;
    }

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.saving = true;
    const formValue = this.form.getRawValue() as GroupCategoryFormValue;
    
    let apiCall;
    if (this.mode === 'create' || this.mode === 'copy') {
      apiCall = this.api.createAndSubmit(formValue);
    } else {
      apiCall = this.api.updateAndSubmit(this.source!.id, formValue);
    }

    apiCall.subscribe({
      next: () => {
        this.saving = false;
        this.toastService.success(this.successMessage(true));
        this.navigationService.navigateToList();
      },
      error: (error) => {
        this.saving = false;
        console.error('❌ Lỗi lưu dữ liệu:', error);
        
        let errorMsg = 'Lỗi lưu và gửi duyệt';
        
        if (error.error?.message) {
          const msg = error.error.message;
          if (msg.includes('unique constraint') || msg.includes('ORA-00001')) {
            errorMsg = 'Dữ liệu đã tồn tại. Vui lòng kiểm tra lại giá trị thành phần hoặc tên thành phần.';
          } else if (msg.includes('ORA-')) {
            errorMsg = 'Lỗi cơ sở dữ liệu. Vui lòng kiểm tra lại thông tin nhập.';
          } else {
            errorMsg = msg;
          }
        } else if (error.status === 403) {
          errorMsg = 'Bạn không có quyền thực hiện thao tác này';
        } else if (error.status === 401) {
          errorMsg = 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại';
        } else if (error.status === 500) {
          errorMsg = 'Lỗi hệ thống. Vui lòng thử lại sau';
        }
        
        this.toastService.error(errorMsg);
      }
    });
  }

  onBack(): void {
    this.navigationService.navigateToList();
  }

  testToast(): void {
    this.toastService.success('Test toast thành công!');
    setTimeout(() => {
      this.toastService.error('Test toast lỗi!');
    }, 1000);
  }

  private successMessage(submitted: boolean): string {
    if (submitted) {
      if (this.mode === 'edit') return 'Sửa và gửi duyệt thành công';
      if (this.mode === 'copy') return 'Sao chép và gửi duyệt thành công';
      return 'Thêm mới và gửi duyệt thành công';
    }

    if (this.mode === 'edit') return 'Sửa thành công';
    if (this.mode === 'copy') return 'Sao chép thành công';
    return 'Thêm mới thành công';
  }

  private isApprovedUpdateBlocked(): boolean {
    if (this.mode !== 'edit' || this.source?.status !== ParamStatus.APPROVED) {
      return false;
    }

    this.toastService.info('Bản ghi đã phê duyệt không thể cập nhật');
    return true;
  }

  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          if (errorKey === 'pastDate') {
            errors.push(`- ${key}: Ngày hiệu lực không được là ngày quá khứ`);
          } else {
            errors.push(`- ${key}: ${errorKey}`);
          }
        });
      }
    });
    return errors;
  }
}
