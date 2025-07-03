import { Component, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TaskComponent, Task, Status, Category } from '../task/task';
import { TaskService } from '../../services/task.service';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-task-section',
  template: `
    <div class="task-section">
      <div class="section-select-day">
        <h1 style="display: flex; align-items: center; gap: 20px;">
          <mat-icon>calendar_today</mat-icon>
          {{ selectDay }}
        <!-- {{ (selectDay === 'Today' ? 'Today\'s Tasks' : selectDay + ' Tasks') }} -->
        </h1>
      </div>
      <div class="section-header">
        <h2>Task List</h2>
        <button
          mat-raised-button
          color="primary"
          (click)="toggleAddForm()"
          class="add-btn"
        >
          <mat-icon>add</mat-icon>
          Add New Task
        </button>
      </div>

      <!-- Add New Task Form Container -->
      <div class="add-task-form-container" [class.expanded]="showAddForm">
        <div class="add-task-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Task Title</mat-label>
              <input
                matInput
                [(ngModel)]="newTask.title"
                placeholder="Enter task title"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="newTask.category">
                <mat-option [value]="Category.Work">Work</mat-option>
                <mat-option [value]="Category.Personal">Personal</mat-option>
                <mat-option [value]="Category.Urgent">Urgent</mat-option>
                <mat-option [value]="Category.Other">Other</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                [(ngModel)]="newTask.description"
                placeholder="Task description"
                rows="2"
              ></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Due Date</mat-label>
              <input matInput type="date" [(ngModel)]="newTask.dueDate" />
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button (click)="cancelAdd()">Cancel</button>
            <button
              mat-raised-button
              color="primary"
              (click)="addTask()"
              [disabled]="!newTask.title"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      <!-- Task List -->
      <div class="tasks-container">
        <div *ngIf="tasks.length === 0" class="no-tasks">
          <mat-icon>task_alt</mat-icon>
          <p>No tasks yet. Add your first task!</p>
        </div>

        <app-task
          *ngFor="let task of tasks"
          [task]="task"
          (taskDeleted)="deleteTask($event)"
          (taskStatusChanged)="updateTaskStatus($event)"
          (taskArchived)="archiveTask($event)"
          (taskUnarchived)="unarchiveTask($event)"
        >
        </app-task>
      </div>
    </div>
  `,
  styles: [
    `

      .section-select-day {
        justify-content: center;
        padding: 10px;
        margin-bottom: 20px;
      }

      .task-section {
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;
      }

      .section-header h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
        font-weight: 500;
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .add-task-form-container {
        height: 0;
        overflow: hidden;
        transition: height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        margin-bottom: 0;
      }

      .add-task-form-container.expanded {
        height: auto;
        margin-bottom: 20px;
      }

      .add-task-form {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }

      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .form-field {
        flex: 1;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
      }

      .tasks-container {
        max-height: 600px;
        overflow-y: auto;
      }

      .no-tasks {
        text-align: center;
        padding: 40px;
        color: #666;
      }

      .no-tasks mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
        margin-bottom: 16px;
      }

      .no-tasks p {
        font-size: 16px;
        margin: 0;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    TaskComponent,
    MatDialogModule
  ],
})
export class TaskSectionComponent {
  @Input() tasks: Task[] = [];

  showAddForm = false;
  Category = Category;
  statusEnum = Status;

  constructor(private taskService: TaskService, private dialog: MatDialog) {}

  newTask: Partial<Task> = {
    title: '',
    description: '',
    category: undefined,
    dueDate: new Date().toISOString().split('T')[0],
    Tags: [],
    status: Status['To-do'],
    archived: false,
  };

  selectDay: string | "Today" = 'Today';

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetNewTask();
    }
  }

  addTask() {
    if (this.newTask.title?.trim()) {
        console.log('Adding task:', this.newTask);
        console.log(Category)
      const task: Task = {
        id: this.taskService.generateId(),
        title: this.newTask.title,
        description: this.newTask.description || '',
        status: this.newTask.status || Status['To-do'],
        category: this.newTask.category || Category.Personal,
        dueDate: this.newTask.dueDate || new Date().toISOString().split('T')[0],
        Tags: this.newTask.Tags || [],
        archived: false, // New tasks are never archived
      };

      this.taskService.addTask(task);
      this.resetNewTask();
      this.showAddForm = false;
    }
  }

  cancelAdd() {
    this.showAddForm = false;
    this.resetNewTask();
  }

  deleteTask(taskId: number) {
    this.taskService.deleteTask(taskId);
  }

  updateTaskStatus(event: { id: number; status: Status }) {
    this.taskService.updateTaskStatus(event.id, event.status);
  }

  archiveTask(taskId: number) {
    this.taskService.archiveTask(taskId);
  }

  unarchiveTask(taskId: number) {
    this.taskService.unarchiveTask(taskId);
  }

  openEditDialog(task: Task) {
    const dialogRef = this.dialog.open(TaskEditDialogComponent, {
      data: task,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update task in the service
        this.taskService.updateTask(result);
      }
    });
  }

  private resetNewTask() {
    this.newTask = {
      title: '',
      description: '',
      category: Category.Personal,
      dueDate: new Date().toISOString().split('T')[0],
      Tags: [],
      status: Status['To-do'],
      archived: false,
    };
  }
}

@Component({
  selector: 'app-task-edit-dialog',
  template: `
    <h2 mat-dialog-title>Edit Task</h2>
    <div mat-dialog-content>
      <div class="form-row">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Task Title</mat-label>
          <input
            matInput
            [(ngModel)]="task.title"
            placeholder="Enter task title"
            required
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="task.category">
            <mat-option [value]="Category.Work">Work</mat-option>
            <mat-option [value]="Category.Personal">Personal</mat-option>
            <mat-option [value]="Category.Urgent">Urgent</mat-option>
            <mat-option [value]="Category.Other">Other</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="task.status">
            <mat-option [value]="statusEnum['To-do']">To-do</mat-option>
            <mat-option [value]="statusEnum['In-Progress']">In-Progress</mat-option>
            <mat-option [value]="statusEnum['Complete']">Complete</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Due Date</mat-label>
          <input matInput type="date" [(ngModel)]="task.dueDate" />
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Description</mat-label>
        <textarea
          matInput
          [(ngModel)]="task.description"
          placeholder="Task description"
          rows="3"
        ></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Tags (comma-separated)</mat-label>
        <input
          matInput
          [(ngModel)]="tagsString"
          placeholder="e.g., work, urgent, review"
        />
      </mat-form-field>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!task.title.trim()">
        Save Changes
      </button>
    </div>
  `,
  styles: [`
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-field {
      flex: 1;
    }
    mat-dialog-content {
      min-width: 500px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ]
})
export class TaskEditDialogComponent {
  task: Task;
  tagsString: string;
  Category = Category;
  statusEnum = Status;

  constructor(
    public dialogRef: MatDialogRef<TaskEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task
  ) {
    this.task = { ...data };
    this.tagsString = this.task.Tags?.join(', ') || '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.task.title?.trim()) {
      // Parse tags from string
      this.task.Tags = this.tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      this.dialogRef.close(this.task);
    }
  }
}
