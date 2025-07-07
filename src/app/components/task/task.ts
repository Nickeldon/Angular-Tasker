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
    <div style="display: flex; flex-direction: column; width: 100%;">
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

      <div class="task-edit" [class.show]="editClicked">
        <div class="edit-header">
          <h4 sty>Edit Task</h4>
          <button
            mat-icon-button
            class="close-btn"
            (click)="onEdit()"
            title="Close editor"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="edit-content">
          <div class="edit-form">
            <div class="form-group">
              <label>Title: <span class="required">*</span></label>
              <input
                type="text"
                [(ngModel)]="editForm.title"
                (blur)="validateTitle()"
                (keydown)="onKeyDown($event)"
                class="form-input"
                [class.error]="errors.title"
                placeholder="Enter task title"
                #titleInput
              />
              <span class="error-message" *ngIf="errors.title">{{
                errors.title
              }}</span>
            </div>
            <div class="form-group">
              <label>Description:</label>
              <textarea
                [(ngModel)]="editForm.description"
                (blur)="validateDescription()"
                (keydown)="onKeyDown($event)"
                class="form-textarea"
                [class.error]="errors.description"
                rows="3"
                placeholder="Enter task description"
              ></textarea>
              <span class="error-message" *ngIf="errors.description">{{
                errors.description
              }}</span>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category:</label>
                <select [(ngModel)]="editForm.category" class="form-select">
                  <option [value]="0">Personal</option>
                  <option [value]="1">Work</option>
                  <option [value]="2">Urgent</option>
                  <option [value]="3">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Due Date: <span class="required">*</span></label>
                <input
                  type="date"
                  [(ngModel)]="editForm.dueDate"
                  (blur)="validateDueDate()"
                  (keydown)="onKeyDown($event)"
                  class="form-input"
                  [class.error]="errors.dueDate"
                />
                <span class="error-message" *ngIf="errors.dueDate">{{
                  errors.dueDate
                }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>Tags:</label>
              <input
                type="text"
                [(ngModel)]="editForm.tags"
                (keydown)="onKeyDown($event)"
                placeholder="Enter comma-separated tags (e.g., work, urgent, meeting)"
                class="form-input"
              />
              <small class="form-hint"
                >Separate multiple tags with commas</small
              >
            </div>
          </div>
          <div class="edit-actions">
            <button
              mat-button
              class="save-btn"
              [disabled]="isSaving || !isFormValid()"
              (click)="onSave()"
            >
              <span *ngIf="!isSaving">Save Changes</span>
              <span *ngIf="isSaving">Saving...</span>
            </button>
            <button
              mat-button
              class="cancel-btn"
              [disabled]="isSaving"
              (click)="onCancel()"
            >
              Cancel
            </button>
          </div>
        </div>
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
  @Output() taskUpdated = new EventEmitter<Task>();

  statusEnum = Status;
  editClicked = false;
  isSaving = false;

  // Form data binding
  editForm = {
    title: '',
    description: '',
    category: Category.Personal,
    dueDate: '',
    tags: '',
  };

  // Validation errors
  errors = {
    title: '',
    description: '',
    dueDate: '',
  };

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
    this.editClicked = !this.editClicked;
    if (this.editClicked) {
      this.initializeEditForm();
      this.taskEditRequested.emit(this.task);
      // Focus on title input after a short delay for animation
      setTimeout(() => {
        const titleInput = document.querySelector(
          '.task-edit.show input[type="text"]'
        ) as HTMLInputElement;
        if (titleInput) {
          titleInput.focus();
        }
      }, 300);
    }
  }

  private initializeEditForm() {
    this.editForm = {
      title: this.task.title,
      description: this.task.description,
      category: this.task.category,
      dueDate: this.task.dueDate,
      tags: this.task.Tags ? this.task.Tags.join(', ') : '',
    };
    this.clearErrors();
  }

  private clearErrors() {
    this.errors = {
      title: '',
      description: '',
      dueDate: '',
    };
  }

  validateTitle() {
    if (!this.editForm.title.trim()) {
      this.errors.title = 'Title is required';
    } else if (this.editForm.title.trim().length < 3) {
      this.errors.title = 'Title must be at least 3 characters long';
    } else {
      this.errors.title = '';
    }
  }

  validateDescription() {
    if (this.editForm.description && this.editForm.description.length > 500) {
      this.errors.description = 'Description must be less than 500 characters';
    } else {
      this.errors.description = '';
    }
  }

  validateDueDate() {
    if (!this.editForm.dueDate) {
      this.errors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(this.editForm.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        this.errors.dueDate = 'Due date cannot be in the past';
      } else {
        this.errors.dueDate = '';
      }
    }
  }

  isFormValid(): boolean {
    this.validateTitle();
    this.validateDueDate();
    this.validateDescription();

    return (
      !this.errors.title && !this.errors.dueDate && !this.errors.description
    );
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onCancel();
      event.preventDefault();
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      if (this.isFormValid()) {
        this.onSave();
      }
      event.preventDefault();
    }
  }

  onSave() {
    if (!this.isFormValid() || this.isSaving) {
      return;
    }

    this.isSaving = true;

    // Simulate saving delay for better UX
    setTimeout(() => {
      const updatedTask: Task = {
        ...this.task,
        title: this.editForm.title.trim(),
        description: this.editForm.description.trim(),
        category: this.editForm.category,
        dueDate: this.editForm.dueDate,
        Tags: this.editForm.tags
          ? this.editForm.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : undefined,
      };

      this.taskUpdated.emit(updatedTask);
      this.isSaving = false;
      this.editClicked = false;
    }, 500);
  }

  onCancel() {
    if (this.isSaving) {
      return;
    }

    this.editClicked = false;
    this.clearErrors();
    // Reset form to original values
    this.initializeEditForm();
  }

  getCategoryName(category: Category): string {
    return Category[category];
  }

  getStatusName(status: Status): string {
    return Status[status];
  }
}
