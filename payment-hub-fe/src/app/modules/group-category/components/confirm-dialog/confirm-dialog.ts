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
  styleUrl: './confirm-dialog.css',
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
    this.isVisible = false;
    const emitData = { 
      confirmed: true, 
      inputValue: this.config.showInput ? this.inputValue : undefined 
    };
    this.confirmed.emit(emitData);
  }

  cancel(): void {
    this.isVisible = false;
    this.confirmed.emit({ confirmed: false });
  }
}
