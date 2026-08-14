import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupCategory, GroupCategoryFormValue } from '../../models/model';
import { GroupCategoryApiService } from '../../services/api.service';

export interface FormDialogData {
  mode: 'create' | 'edit' | 'copy';
  source?: GroupCategory;
}

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.html',
  styleUrls: ['./form-dialog.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class FormDialogComponent implements OnInit {
  @Input() mode: 'create' | 'edit' | 'copy' = 'create';
  @Input() source?: GroupCategory;
  @Output() saved = new EventEmitter<GroupCategory | null>();

  form: FormGroup;
  title: string = '';
  submitting = false;
  componentOptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private api: GroupCategoryApiService,
  ) {
    this.form = this.fb.group({
      paramName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      paramValue: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      paramType: ['', [Validators.required, Validators.maxLength(255)]],
      componentCode: ['', Validators.required],
      description: ['', Validators.maxLength(4000)],
      effectiveDate: ['', Validators.required],
      endEffectiveDate: ['']
    });
  }

  ngOnInit(): void {
    this.setTitle();
    this.loadComponentOptions();
    if (this.source && (this.mode === 'edit' || this.mode === 'copy')) {
      this.form.patchValue({
        paramName: this.source.paramName,
        paramValue: this.source.paramValue,
        paramType: this.source.paramType,
        componentCode: this.source.componentCode,
        description: this.source.description,
        effectiveDate: this.source.effectiveDate,
        endEffectiveDate: this.source.endEffectiveDate
      });

      if (this.mode === 'copy') {
        this.form.patchValue({
          paramValue: `${this.source.paramValue}_copy`
        });
      }
    }
  }

  private setTitle(): void {
    switch (this.mode) {
      case 'create':
        this.title = 'Thêm mới';
        break;
      case 'edit':
        this.title = 'Sửa thông tin';
        break;
      case 'copy':
        this.title = 'Sao chép';
        break;
    }
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
    if (this.form.valid) {
      const formValue = this.form.value as GroupCategoryFormValue;
      const result: GroupCategory = {
        id: this.source?.id || 0,
        ...formValue,
        endEffectiveDate: formValue.endEffectiveDate || undefined,
        status: this.source?.status || 1,
        isActive: this.source?.isActive || 1,
      };
      this.saved.emit(result);
    }
  }

  saveAndSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value as GroupCategoryFormValue;
      const result: GroupCategory = {
        id: this.source?.id || 0,
        ...formValue,
        endEffectiveDate: formValue.endEffectiveDate || undefined,
        status: 3,
        isActive: this.source?.isActive || 1,
      };
      this.saved.emit(result);
    }
  }

  onCancel(): void {
    this.saved.emit(null);
  }

  checkEffectiveDateWarning(): boolean {
    const effectiveDate = this.form.get('effectiveDate')?.value;
    const endEffectiveDate = this.form.get('endEffectiveDate')?.value;
    return effectiveDate && endEffectiveDate && new Date(endEffectiveDate) <= new Date(effectiveDate);
  }
}
