import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'info' | 'question';
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ConfirmDialogComponent {
  @Input() config: ConfirmDialogConfig = {
    title: 'Xác nhận',
    message: 'Bạn có chắc chắn muốn thực hiện thao tác này?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    icon: 'question'
  };
  
  @Output() confirmed = new EventEmitter<{ confirmed: boolean; inputValue?: string }>();

  inputValue: string = '';
  isVisible: boolean = true;

  confirm(): void {
    console.log('📢 ConfirmDialog.confirm() called');
    console.log('📢 Config:', this.config);
    console.log('📢 Input value:', this.inputValue);
    this.isVisible = false;
    const emitData = { 
      confirmed: true, 
      inputValue: this.config.showInput ? this.inputValue : undefined 
    };
    console.log('📢 Emitting:', emitData);
    this.confirmed.emit(emitData);
  }

  cancel(): void {
    console.log('📢 ConfirmDialog.cancel() called');
    this.isVisible = false;
    this.confirmed.emit({ confirmed: false });
  }
}
