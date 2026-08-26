import { Component, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TuiButton } from '@taiga-ui/core';
import { TuiTextarea } from '@taiga-ui/kit';

@Component({
  selector: 'app-reject-reason-dialog',
  templateUrl: './reject-reason-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, TuiTextarea, TuiButton],
})
export class RejectReasonDialogComponent {
  reasonControl = new FormControl('', [Validators.required, Validators.maxLength(500)]);
  @Output() reasonSubmitted = new EventEmitter<string | null>();

  confirm(): void {
    if (this.reasonControl.invalid) { this.reasonControl.markAsTouched(); return; }
    this.reasonSubmitted.emit(this.reasonControl.value ?? '');
  }
  cancel(): void { this.reasonSubmitted.emit(null); }
}