import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GroupCategoryFilter } from '../../models/filter.model';
import { IsActive, ParamStatus, ParamStatusLabel } from '../../models/status.enum';

interface Option<T> {
  value: T | null;
  label: string;
}

@Component({
  selector: 'app-group-category-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-filter.html',
  styleUrls: ['./search-filter.scss'],
})
export class SearchFilterComponent {
  @Output() search = new EventEmitter<GroupCategoryFilter>();
  @Output() reset = new EventEmitter<void>();

  readonly ALL_OPTION_LABEL = 'Tất cả';

  readonly statusItems: Option<ParamStatus>[] = [
    { value: null, label: this.ALL_OPTION_LABEL },
    ...Object.values(ParamStatus)
      .filter((value): value is ParamStatus => typeof value === 'number')
      .map((value) => ({ value, label: ParamStatusLabel[value] })),
  ];

  readonly isActiveItems: Option<IsActive>[] = [
    { value: null, label: this.ALL_OPTION_LABEL },
    { value: IsActive.ACTIVE, label: 'Hoạt động' },
    { value: IsActive.INACTIVE, label: 'Không hoạt động' },
  ];

  readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      paramType: [''],
      paramValue: [''],
      paramName: [''],
      status: [this.statusItems[0]],
      isActiveOpt: [this.isActiveItems[0]],
    });
  }

  readonly statusLabelFn = (item: Option<ParamStatus> | null) => item?.label ?? this.ALL_OPTION_LABEL;
  readonly isActiveLabelFn = (item: Option<IsActive> | null) => item?.label ?? this.ALL_OPTION_LABEL;

  onSearch(): void {
    const { status, isActiveOpt, ...rest } = this.form.value;
    this.search.emit({
      ...rest,
      statuses: status?.value != null ? [status.value] : [],
      isActiveList: isActiveOpt?.value != null ? [isActiveOpt.value] : [],
      page: 1,
      pageSize: 20,
    } as GroupCategoryFilter);
  }

  onReset(): void {
    this.form.reset({
      paramType: '',
      paramValue: '',
      paramName: '',
      status: this.statusItems[0],
      isActiveOpt: this.isActiveItems[0],
    });
    this.reset.emit();
  }
}