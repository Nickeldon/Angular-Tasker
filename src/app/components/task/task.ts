import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Enum and interface definitions
export enum Status {
  'To-do',
  'In-Progress',
  'Complete',
}

export enum Category {
  'Personal',
  'Work',
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

// TaskComponent: Represents a single task item with its details and actions
@Component({
  selector: 'app-task', // Will be referenced as the enclosed <app-task> object
  template: `
    <div class="task-item" [class.archived]="task.archived">
      <!-- Is the task "archived" -->

      <!-- Verify if checkbox element from Material is already checked or marked as complete in the JSON -->
      <mat-checkbox
        [checked]="task.status === statusEnum.Complete"
        (change)="onStatusChange($event)"
      >
      </mat-checkbox>
      <div class="task-content" (click)="onEdit()">
        <div class="task-title">{{ task.title }}</div>
        <div class="task-meta">
          <span class="task-category">{{
            getCategoryName(task.category)
          }}</span>
          <span class="task-status">{{ getStatusName(task.status) }}</span>
          <span class="task-due-date">Due: {{ task.dueDate }}</span>
          <span class="task-archived" *ngIf="task.archived">ARCHIVED</span>
        </div>
      </div>
      <div class="task-actions">
        <button
          mat-icon-button
          class="edit-btn"
          (click)="onEdit()"
          title="Edit task"
        >
          <mat-icon>edit</mat-icon>
        </button>
        @if (!task.archived) {
        <button
          mat-icon-button
          class="archive-btn"
          (click)="onArchive()"
          title="Archive task"
        >
          <mat-icon>archive</mat-icon>
        </button>
        } @else {
        <button
          mat-icon-button
          class="unarchive-btn"
          (click)="onUnarchive()"
          title="Unarchive task"
        >
          <mat-icon>unarchive</mat-icon>
        </button>
        }

        <button
          mat-icon-button
          class="delete-btn"
          (click)="onDelete()"
          title="Delete task"
        >
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./task.css'],
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,
  ],
})

// **The following class was done with the help of AI**
// Represents a single task item with its details and actions
export class TaskComponent {
  @Input() task!: Task;
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() taskStatusChanged = new EventEmitter<{
    id: number;
    status: Status;
  }>();
  @Output() taskArchived = new EventEmitter<number>();
  @Output() taskUnarchived = new EventEmitter<number>();
  @Output() taskEditRequested = new EventEmitter<Task>();

  statusEnum = Status;

  onStatusChange(event: any) {
    const newStatus = event.checked ? Status.Complete : Status['To-do'];
    this.taskStatusChanged.emit({ id: this.task.id, status: newStatus });
  }

  onDelete() {
    this.taskDeleted.emit(this.task.id);
  }

  onArchive() {
    console.log('Archiving task:', this.task.id);
    this.task.archived = true; // Update the task's archived status
    this.taskArchived.emit(this.task.id);
  }

  onUnarchive() {
    console.log('Unarchiving task:', this.task.id);
    this.task.archived = false; // Update the task's archived status
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
