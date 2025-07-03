import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export enum Status {
  'To-do',
  'In-Progress',
  'Complete',
}

export enum Category {
  'Work',
  'Personal',
  'Urgent',
  'Other',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: Status;
  dueDate: string;
  Tags: string[] | undefined;
  category: Category;
  archived: boolean;
}

@Component({
  selector: 'app-task',
  template: `
    <div class="task-item" [class.archived]="task.archived">
      <mat-checkbox
        [checked]="task.status === statusEnum.Complete"
        (change)="onStatusChange($event)">
      </mat-checkbox>
      <div class="task-content" (click)="onEdit()">
        <div class="task-title">{{ task.title }}</div>
        <div class="task-meta">
          <span class="task-category">{{ getCategoryName(task.category) }}</span>
          <span class="task-status">{{ getStatusName(task.status) }}</span>
          <span class="task-due-date">Due: {{ task.dueDate }}</span>
          <span class="task-archived" *ngIf="task.archived">ARCHIVED</span>
        </div>
      </div>
      <div class="task-actions">
        <button mat-icon-button class="edit-btn" (click)="onEdit()" title="Edit task">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button class="archive-btn" (click)="onArchive()" *ngIf="!task.archived" title="Archive task">
          <mat-icon>archive</mat-icon>
        </button>
        <button mat-icon-button class="unarchive-btn" (click)="onUnarchive()" *ngIf="task.archived" title="Unarchive task">
          <mat-icon>unarchive</mat-icon>
        </button>
        <button mat-icon-button class="delete-btn" (click)="onDelete()" title="Delete task">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .task-item {
        display: flex;
        align-items: center;
        border: 1px solid #e0e0e0;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 8px;
        background: rgba(245, 245, 245, 0.17);
        transition: background 0.2s, box-shadow 0.2s;
        gap: 12px;
      }

      .task-item:hover {
        background: #e3f2fd;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .task-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .task-title {
        font-weight: 500;
        font-size: 16px;
        color: #333;
      }

      .task-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #666;
      }

      .task-category {
        background: #e3f2fd;
        padding: 2px 8px;
        border-radius: 12px;
        color: #1976d2;
      }

      .task-status {
        background: #f3e5f5;
        padding: 2px 8px;
        border-radius: 12px;
        color: #7b1fa2;
      }

      .task-due-date {
        color: #666;
      }

      .task-archived {
        background: #ffecb3;
        padding: 2px 8px;
        border-radius: 12px;
        color: #f57c00;
        font-weight: 500;
        text-transform: uppercase;
        font-size: 10px;
      }

      .task-actions {
        display: flex;
        gap: 4px;
      }

      .delete-btn {
        color: #f44336;
      }

      .delete-btn:hover {
        background: rgba(244, 67, 54, 0.1);
      }

      .archive-btn {
        color: #ff9800;
      }

      .archive-btn:hover {
        background: rgba(255, 152, 0, 0.1);
      }

      .unarchive-btn {
        color: #4caf50;
      }

      .unarchive-btn:hover {
        background: rgba(76, 175, 80, 0.1);
      }

      .task-item.archived {
        opacity: 0.7;
        background: #f5f5f5;
      }
    `,
  ],
  standalone: true,
  imports: [MatCheckboxModule, MatButtonModule, MatIconModule, FormsModule, CommonModule],
})

export class TaskComponent {
  @Input() task!: Task;
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() taskStatusChanged = new EventEmitter<{id: number, status: Status}>();
  @Output() taskArchived = new EventEmitter<number>();
  @Output() taskUnarchived = new EventEmitter<number>();
  @Output() taskEditRequested = new EventEmitter<Task>();

  statusEnum = Status;

  onStatusChange(event: any) {
    const newStatus = event.checked ? Status.Complete : Status['To-do'];
    this.taskStatusChanged.emit({id: this.task.id, status: newStatus});
  }

  onDelete() {
    this.taskDeleted.emit(this.task.id);
  }

  onArchive() {
    this.taskArchived.emit(this.task.id);
  }

  onUnarchive() {
    this.taskUnarchived.emit(this.task.id);
  }

  onEdit() {
    this.taskEditRequested.emit(this.task);
  }

  getCategoryName(category: Category): string {
    return Category[category];
  }

  getStatusName(status: Status): string {
    return Status[status];
  }
}
