import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton } from '@taiga-ui/core';
import { GroupCategoryNavigationService, NavigationState } from '../../services/navigation.service';
import { GroupCategoryApiService } from '../../services/api.service';
import { GroupCategory } from '../../models/model';
import { FormDialogComponent } from '../../components/form-dialog/form-dialog';

@Component({
  selector: 'app-group-category-add-page',
  templateUrl: './add-page.html',
  styleUrls: ['./add-page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [CommonModule, TuiButton, FormDialogComponent],
})
export class GroupCategoryAddPageComponent implements OnInit {
  @ViewChild(FormDialogComponent) formDialog?: FormDialogComponent;

  mode: 'create' | 'edit' | 'copy' = 'create';
  source: GroupCategory | null = null;
  navigationState: NavigationState | null = null;
  pageTitle = 'Thêm mới tham số danh mục theo nhóm';
  breadcrumbLast = 'Thêm mới';
  saving = false;

  constructor(
    private readonly navigationService: GroupCategoryNavigationService,
    private readonly api: GroupCategoryApiService,
  ) {}

  ngOnInit(): void {
    this.navigationService.navigation$.subscribe((state) => {
      this.navigationState = state;

      if (state.mode === 'add') {
        this.mode = 'create';
        this.source = null;
        this.pageTitle = 'Thêm mới tham số danh mục theo nhóm';
        this.breadcrumbLast = 'Thêm mới';
      } else if (state.mode === 'edit') {
        this.mode = 'edit';
        this.source = state.record || null;
        this.pageTitle = 'Sửa tham số danh mục theo nhóm';
        this.breadcrumbLast = 'Sửa';
      } else if (state.mode === 'copy') {
        this.mode = 'copy';
        this.source = state.record || null;
        this.pageTitle = 'Thêm mới tham số danh mục theo nhóm';
        this.breadcrumbLast = 'Sao chép';
      }
    });
  }

  onSaved(result: GroupCategory | null): void {
    if (result) {
      this.saving = true;
      const formValue = {
        paramName: result.paramName,
        paramValue: result.paramValue,
        paramType: result.paramType,
        componentCode: result.componentCode,
        description: result.description,
        effectiveDate: result.effectiveDate,
        endEffectiveDate: result.endEffectiveDate
      };

      let apiCall;
      if (this.mode === 'create') {
        apiCall = result.status === 3 
          ? this.api.createAndSubmit(formValue)
          : this.api.create(formValue);
      } else {
        apiCall = result.status === 3
          ? this.api.updateAndSubmit(result.id, formValue)
          : this.api.update(result.id, formValue);
      }

      apiCall.subscribe({
        next: () => {
          this.saving = false;
          this.navigationService.navigateToList();
        },
        error: (error) => {
          this.saving = false;
          console.error('Lỗi lưu dữ liệu:', error);
          alert('Lỗi lưu dữ liệu. Vui lòng thử lại.');
        }
      });
    }
  }

  onBack(): void {
    this.navigationService.navigateToList();
  }

  onClose(): void {
    this.navigationService.navigateToList();
  }

  save(): void {
    this.saving = true;
    this.formDialog?.save();
  }

  saveAndSubmit(): void {
    this.saving = true;
    this.formDialog?.saveAndSubmit();
  }
}