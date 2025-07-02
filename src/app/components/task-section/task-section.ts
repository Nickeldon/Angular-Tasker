import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TaskComponent, Task, Status, Category } from '../task/task';

@Component({
  selector: "app-task-section",
  template: `
    <div class="task-section">
      <div class="section-header">
        <h2>Task List</h2>
        <button mat-raised-button color="primary" (click)="toggleAddForm()" class="add-btn">
          <mat-icon>add</mat-icon>
          Add New Task
        </button>
      </div>

      <!-- Add New Task Form -->
      <div class="add-task-form" *ngIf="showAddForm">
        <div class="form-row">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Task Title</mat-label>
            <input matInput [(ngModel)]="newTask.title" placeholder="Enter task title">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="newTask.category">
              <mat-option [value]="categoryEnum.Work">Work</mat-option>
              <mat-option [value]="categoryEnum.Personal">Personal</mat-option>
              <mat-option [value]="categoryEnum.Urgent">Urgent</mat-option>
              <mat-option [value]="categoryEnum.Other">Other</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="newTask.description" placeholder="Task description" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Due Date</mat-label>
            <input matInput type="date" [(ngModel)]="newTask.dueDate">
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button (click)="cancelAdd()">Cancel</button>
          <button mat-raised-button color="primary" (click)="addTask()" [disabled]="!newTask.title">
            Add Task
          </button>
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
          (taskStatusChanged)="updateTaskStatus($event)">
        </app-task>
      </div>
    </div>
  `,
  styles: [
    `
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

      .add-task-form {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
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
    `
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
    TaskComponent
  ]
})
export class TaskSectionComponent {
  showAddForm = false;
  categoryEnum = Category;
  statusEnum = Status;

  newTask: Partial<Task> = {
    title: '',
    description: '',
    category: Category.Personal,
    dueDate: new Date().toISOString().split('T')[0],
    Tags: [],
    status: Status['To-do']
  };

  tasks: Task[] = [
    {
      id: 1,
      title: 'Buy groceries',
      status: Status['In-Progress'],
      category: Category.Personal,
      description: 'Get ingredients for dinner this week',
      dueDate: '2025-07-02',
      Tags: ['shopping', 'food'],
    },
    {
      id: 2,
      title: 'Walk the dog',
      status: Status['To-do'],
      category: Category.Personal,
      description: 'Morning walk in the park',
      dueDate: '2025-07-02',
      Tags: ['exercise', 'pet'],
    },
    {
      id: 3,
      title: 'Complete project report',
      status: Status['In-Progress'],
      category: Category.Work,
      description: 'Finish quarterly report for management',
      dueDate: '2025-07-05',
      Tags: ['work', 'report'],
    },
  ];

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetNewTask();
    }
  }

  addTask() {
    if (this.newTask.title?.trim()) {
      const task: Task = {
        id: this.generateId(),
        title: this.newTask.title,
        description: this.newTask.description || '',
        status: this.newTask.status || Status['To-do'],
        category: this.newTask.category || Category.Personal,
        dueDate: this.newTask.dueDate || new Date().toISOString().split('T')[0],
        Tags: this.newTask.Tags || []
      };

      this.tasks.unshift(task); // Add to beginning of list
      this.resetNewTask();
      this.showAddForm = false;
    }
  }

  cancelAdd() {
    this.showAddForm = false;
    this.resetNewTask();
  }

  deleteTask(taskId: number) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
  }

  updateTaskStatus(event: {id: number, status: Status}) {
    const task = this.tasks.find(t => t.id === event.id);
    if (task) {
      task.status = event.status;
    }
  }

  private generateId(): number {
    return Math.max(...this.tasks.map(t => t.id), 0) + 1;
  }

  private resetNewTask() {
    this.newTask = {
      title: '',
      description: '',
      category: Category.Personal,
      dueDate: new Date().toISOString().split('T')[0],
      Tags: [],
      status: Status['To-do']
    };
  }
}
