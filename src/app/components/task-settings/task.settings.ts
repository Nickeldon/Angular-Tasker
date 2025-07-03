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

          <div class="setting-item">
            <div class="setting-info">
              <h4>Export Tasks</h4>
              <p>Download all your tasks as a JSON file</p>
            </div>
            <button
              mat-button
              (click)="exportTasks()"
              class="action-btn export"
            >
              <mat-icon>download</mat-icon>
              Export
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Import Tasks</h4>
              <p>Import tasks from a JSON file</p>
            </div>
            <div class="import-section">
              <input
                type="file"
                accept=".json"
                (change)="onFileSelected($event)"
                #fileInput
                hidden
              />
              <button
                mat-button
                (click)="fileInput.click()"
                class="action-btn import"
              >
                <mat-icon>upload</mat-icon>
                Import
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Reset Data</h4>
              <p>Clear all tasks and reset to default data</p>
            </div>
            <button mat-button (click)="resetData()" class="action-btn danger">
              <mat-icon>refresh</mat-icon>
              Reset
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Clear All Tasks</h4>
              <p>Permanently delete all tasks</p>
            </div>
            <button
              mat-button
              (click)="clearAllTasks()"
              class="action-btn danger"
            >
              <mat-icon>delete_forever</mat-icon>
              Clear All
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h3>Application Info</h3>

          <div class="info-item">
            <span class="info-label">Version:</span>
            <span class="info-value">1.0.0</span>
          </div>

          <div class="info-item">
            <span class="info-label">Storage:</span>
            <span class="info-value">localStorage</span>
          </div>

          <div class="info-item">
            <span class="info-label">Total Tasks:</span>
            <span class="info-value">{{ taskStats.total }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Active Tasks:</span>
            <span class="info-value">{{ taskStats.active }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Archived Tasks:</span>
            <span class="info-value">{{ taskStats.archived }}</span>
          </div>
        </div>

        <!-- Status Messages -->
        <div class="status-message" *ngIf="statusMessage" [class]="messageType">
          <mat-icon>{{
            messageType === 'success' ? 'check_circle' : 'error'
          }}</mat-icon>
          {{ statusMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        width: 700px;
        margin: 20px auto;
        overflow: hidden;
      }

      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30px 34px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 5px;
      }

      .settings-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }

      .close-btn {
        color: #764ba2;
        border: none;
        height: 40px;
        width: 40px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        border-radius: 50%;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .close-btn:hover {
        color: #667eea;
      }

      .settings-content {
        padding: 24px;
        max-height: 70vh;
        overflow-y: auto;
      }

      .settings-section {
        margin-bottom: 32px;
      }

      .settings-section h3 {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 20px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #e9ecef;
      }

      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        margin-bottom: 12px;
        transition: all 0.3s ease;
      }

      .setting-item:hover {
        background: #f8f9fa;
        border-color: #dee2e6;
      }

      .setting-info h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 500;
        color: #2c3e50;
      }

      .setting-info p {
        margin: 0;
        font-size: 14px;
        color: #6c757d;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .action-btn.export {
        background: #28a745;
        color: white;
      }

      .action-btn.export:hover {
        background: #218838;
      }

      .action-btn.import {
        background: #007bff;
        color: white;
      }

      .action-btn.import:hover {
        background: #0056b3;
      }

      .action-btn.danger {
        background: #dc3545;
        color: white;
      }

      .action-btn.danger:hover {
        background: #c82333;
      }

      .import-section {
        display: flex;
        align-items: center;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e9ecef;
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .info-label {
        font-weight: 500;
        color: #495057;
      }

      .info-value {
        color: #6c757d;
        font-weight: 600;
      }

      .status-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 6px;
        margin-top: 20px;
        font-weight: 500;
      }

      .status-message.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .status-message.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon, MatButton],
})
export class TaskSettingsComponent {
  @Output() close = new EventEmitter<void>();

  taskStats: any = {};
  statusMessage = '';
  messageType: 'success' | 'error' = 'success';

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
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.statusMessage = message;
    this.messageType = type;

    // Clear message after 3 seconds
    setTimeout(() => {
      this.statusMessage = '';
    }, 3000);
  }
}
