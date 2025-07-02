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
}

@Component({
  selector: 'app-task',
  template: `
    <div class="task-item">
      <mat-checkbox
        [checked]="task.status === statusEnum.Complete"
        (change)="onStatusChange($event)">
      </mat-checkbox>
      <div class="task-content">
        <div class="task-title">{{ task.title }}</div>
        <div class="task-meta">
          <span class="task-category">{{ getCategoryName(task.category) }}</span>
          <span class="task-status">{{ getStatusName(task.status) }}</span>
          <span class="task-due-date">Due: {{ task.dueDate }}</span>
        </div>
      </div>
      <button mat-icon-button class="delete-btn" (click)="onDelete()">
        <mat-icon>delete</mat-icon>
      </button>
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

      .delete-btn {
        color: #f44336;
      }

      .delete-btn:hover {
        background: rgba(244, 67, 54, 0.1);
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

  statusEnum = Status;

  onStatusChange(event: any) {
    const newStatus = event.checked ? Status.Complete : Status['To-do'];
    this.taskStatusChanged.emit({id: this.task.id, status: newStatus});
  }

  onDelete() {
    this.taskDeleted.emit(this.task.id);
  }

  getCategoryName(category: Category): string {
    return Category[category];
  }

  getStatusName(status: Status): string {
    return Status[status];
  }
}
