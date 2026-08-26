import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GroupCategoryFilter } from '../../models/filter.model';
import { IsActive, ParamStatus, ParamStatusLabel } from '../../models/status.enum';

interface Option<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-group-category-search-filter',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './search-filter.html',
})
export class SearchFilterComponent {
  @Output() search = new EventEmitter<GroupCategoryFilter>();
  @Output() reset = new EventEmitter<void>();

  readonly ALL_OPTION_LABEL = 'Tất cả';

  readonly statusItems: Option<ParamStatus>[] = [
    ...Object.values(ParamStatus)
      .filter((value): value is ParamStatus => typeof value === 'number')
      .map((value) => ({ value, label: ParamStatusLabel[value] })),
  ];

  readonly isActiveItems: Option<IsActive>[] = [
    { value: IsActive.ACTIVE, label: 'Hoạt động' },
    { value: IsActive.INACTIVE, label: 'Không hoạt động' },
  ];

  readonly form: FormGroup;
  statusDropdownOpen = false;
  isActiveDropdownOpen = false;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      paramType: [''],
      paramValue: [''],
      paramName: [''],
      statuses: [[] as ParamStatus[]],
      isActiveList: [[] as IsActive[]],
    });
  }

  get statusText(): string {
    return this.formatSelectedLabels(this.statusItems, this.selectedStatuses);
  }

  get isActiveText(): string {
    return this.formatSelectedLabels(this.isActiveItems, this.selectedActiveStatuses);
  }

  get selectedStatuses(): ParamStatus[] {
    return this.form.get('statuses')?.value ?? [];
  }

  get selectedActiveStatuses(): IsActive[] {
    return this.form.get('isActiveList')?.value ?? [];
  }

  toggleStatusDropdown(): void {
    this.statusDropdownOpen = !this.statusDropdownOpen;
    this.isActiveDropdownOpen = false;
  }

  toggleIsActiveDropdown(): void {
    this.isActiveDropdownOpen = !this.isActiveDropdownOpen;
    this.statusDropdownOpen = false;
  }

  clearStatuses(): void {
    this.form.patchValue({ statuses: [] });
  }

  clearActiveStatuses(): void {
    this.form.patchValue({ isActiveList: [] });
  }

  isStatusSelected(value: ParamStatus): boolean {
    return this.selectedStatuses.includes(value);
  }

  isActiveSelected(value: IsActive): boolean {
    return this.selectedActiveStatuses.includes(value);
  }

  toggleStatus(value: ParamStatus, checked: boolean): void {
    this.form.patchValue({
      statuses: this.toggleValue(this.selectedStatuses, value, checked),
    });
  }

  toggleActiveStatus(value: IsActive, checked: boolean): void {
    this.form.patchValue({
      isActiveList: this.toggleValue(this.selectedActiveStatuses, value, checked),
    });
  }

  onSearch(): void {
    const { statuses, isActiveList, ...rest } = this.form.value;
    this.search.emit({
      ...rest,
      statuses: statuses ?? [],
      isActiveList: isActiveList ?? [],
      page: 1,
      pageSize: 20,
    } as GroupCategoryFilter);
    this.closeDropdowns();
  }

  onReset(): void {
    this.form.reset({
      paramType: '',
      paramValue: '',
      paramName: '',
      statuses: [],
      isActiveList: [],
    });
    this.closeDropdowns();
    this.reset.emit();
  }

  private toggleValue<T>(items: T[], value: T, checked: boolean): T[] {
    const selected = new Set(items);
    checked ? selected.add(value) : selected.delete(value);
    return Array.from(selected);
  }

  private formatSelectedLabels<T>(items: Option<T>[], selectedValues: T[]): string {
    if (!selectedValues.length) return this.ALL_OPTION_LABEL;

    return items
      .filter((item) => selectedValues.includes(item.value))
      .map((item) => item.label)
      .join(', ');
  }

  private closeDropdowns(): void {
    this.statusDropdownOpen = false;
    this.isActiveDropdownOpen = false;
  }
}
