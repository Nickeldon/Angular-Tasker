import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-settings',
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h2>Settings</h2>
        <button mat-icon-button (click)="onClose()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="settings-content">
        <div class="settings-section">
          <h3>Data Management</h3>
          <div *ngFor="let setting of settings.utilities" class="setting-item">
            <div class="setting-info">
              <h4>{{ setting.title }}</h4>
              <p>{{ setting.description }}</p>
            </div>
            <div class="import-section" *ngIf="setting.type === 'import'">
              <input
                type="file"
                accept=".json"
                (change)="onFileSelected($event)"
                class="file-input"
                #fileInput
                hidden
              />
              <button
                mat-button
                [ngClass]="setting.buttonClass"
                (click)="fileInput.click()"
              >
                <mat-icon>{{ setting.icon }}</mat-icon>
                {{ setting.buttonText }}
              </button>
            </div>

            <button
              *ngIf="setting.type === 'button'"
              mat-button
              [ngClass]="setting.buttonClass"
              (click)="setting?.action()"
            >
              <mat-icon>{{ setting.icon }}</mat-icon>
              {{ setting.buttonText }}
            </button>
          </div>

          <div class="settings-section">
            <h3>About the app</h3>

            <div *ngFor="let item of settings.about" class="info-item">
              <span class="info-label">{{ item.label }}</span>
              <span class="info-value">{{ item.value }}</span>
            </div>
          </div>

          <!-- Status Messages -->
          <div
            class="status-message"
            *ngIf="statusMessage"
            [class]="messageType"
          >
            <mat-icon>{{
              messageType === 'success' ? 'check_circle' : 'error'
            }}</mat-icon>
            {{ statusMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./task.settings.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon, MatButton],
})
export class TaskSettingsComponent {
  @Output() close = new EventEmitter<void>();

  taskStats: any = {};
  statusMessage = '';
  messageType: 'success' | 'error' = 'success';

  settings = {
    about: [
      { label: 'Author', value: 'Nickeldon' },
      { label: 'Version', value: '1.0.0' },
      { label: 'Storage', value: 'localStorage' },
      { label: 'Total Tasks', value: this.taskStats.total || '0' },
      { label: 'Active Tasks', value: this.taskStats.active || '0' },
      { label: 'Archived Tasks', value: this.taskStats.archived || '0' },
    ],
    utilities: [
      {
        title: 'Export Tasks',
        description: 'Download all your tasks as a JSON file',
        type: 'button',
        icon: 'download',
        buttonText: 'Export',
        buttonClass: 'action-btn export',
        action: () => this.exportTasks(),
      },
      {
        title: 'Import Tasks',
        description: 'Import tasks from a JSON file',
        type: 'import',
        icon: 'upload',
        buttonText: 'Import',
        buttonClass: 'action-btn import',
      },
      {
        title: 'Reset Data',
        description: 'Clear all tasks and reset to default data',
        type: 'button',
        icon: 'refresh',
        buttonText: 'Reset',
        buttonClass: 'action-btn danger',
        action: () => this.resetData(),
      },
      {
        title: 'Clear All Tasks',
        description: 'Permanently delete all tasks',
        type: 'button',
        icon: 'delete_forever',
        buttonText: 'Clear All',
        buttonClass: 'action-btn danger',
        action: () => this.clearAllTasks(),
      },
    ],
  };

  constructor(private taskService: TaskService) {
    this.updateStats();
  }

  onClose() {
    this.close.emit();
  }

  exportTasks() {
    try {
      this.taskService.exportTasksAsJSON();
      this.showMessage('Tasks exported successfully!', 'success');
    } catch (error) {
      this.showMessage('Failed to export tasks', 'error');
    }
  }

  onFileSelected(event: any) {
    console.log('File selected:', event);
    const file = event.target.files[0];
    if (file) {
      this.taskService
        .importTasksFromJSON(file)
        .then(() => {
          this.showMessage('Tasks imported successfully!', 'success');
          this.updateStats();
        })
        .catch(() => {
          this.showMessage('Failed to import tasks', 'error');
        });
    }
  }

  resetData() {
    if (
      confirm(
        'Are you sure you want to reset all data? This action cannot be undone.'
      )
    ) {
      this.taskService.resetToOriginalData();
      this.showMessage('Data reset to defaults', 'success');
      this.updateStats();
    }
  }

  clearAllTasks() {
    if (
      confirm(
        'Are you sure you want to delete all tasks? This action cannot be undone.'
      )
    ) {
      this.taskService.clearAllTasks();
      this.showMessage('All tasks cleared', 'success');
      this.updateStats();
    }
  }

  private updateStats() {
    this.taskStats = this.taskService.getTaskStats();
    // Update about stats
    this.settings.about = [
      { label: 'Author', value: 'Nickeldon' },
      { label: 'Version', value: '1.0.0' },
      { label: 'Storage', value: 'localStorage' },
      { label: 'Total Tasks', value: this.taskStats.total || '0' },
      { label: 'Active Tasks', value: this.taskStats.active || '0' },
      { label: 'Archived Tasks', value: this.taskStats.archived || '0' },
    ];
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.statusMessage = message;
    this.messageType = type;
    setTimeout(() => {
      this.statusMessage = '';
    }, 3000);
  }
}
