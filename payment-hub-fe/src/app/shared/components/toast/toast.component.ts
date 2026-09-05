import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div 
          class="toast toast-{{ toast.type }}"
          [@fadeInOut]>
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.7 5.3L8.5 13.5L3.3 8.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            }
            @if (toast.type === 'error') {
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            }
          </div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      max-width: 400px;
    }
    
    .toast-success {
      background-color: #10b981;
      color: white;
    }
    
    .toast-error {
      background-color: #ef4444;
      color: white;
    }
    
    .toast-info {
      background-color: #3b82f6;
      color: white;
    }
    
    .toast-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }
    
    .toast-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.5;
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
