import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSidenavContent } from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Category, Status } from '../task/task';
import { TaskSettingsComponent } from '../task-settings/task.settings';

@Component({
  selector: 'app-task-navigation',
  template: `
    <mat-sidenav-container style="border-radius: 20px;">
      <mat-sidenav mode="side" opened class="sidebar">
        <!-- Header -->
        <div class="sidebar-header">
          <h2>Menu</h2>
          <button mat-icon-button>
            <mat-icon>menu</mat-icon>
          </button>
        </div>

        <!-- Search -->
        <div class="search-section">
          <div class="search-input">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              type="text"
              placeholder="Search"
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
            />
          </div>
        </div>

        <!-- Tasks Section -->
        <div class="nav-section">
          <h3 class="section-title">TASKS</h3>
          <ul class="nav-list">
            <li
              class="nav-item"
              [class.active]="isActiveFilter('navigation', task.filter)"
              *ngFor="let task of taskItems"
              (click)="onNavigationClick(task.filter)"
              [class.disabled]="task.disabled"
            >
              <mat-icon class="nav-icon">{{ task.icon }}</mat-icon>
              <span class="nav-label">{{ task.label }}</span>
              <span class="nav-count" *ngIf="task.count">{{ task.count }}</span>
            </li>
          </ul>
        </div>

        <!-- Lists Section -->
        <div class="nav-section">
          <h3 class="section-title">LISTS</h3>
          <ul class="nav-list">
            <li
              class="nav-item"
              [class.active]="isActiveFilter('category', list.category)"
              *ngFor="let list of listItems"
              (click)="onCategoryFilter(list.category)"
            >
              <div
                class="color-indicator"
                [style.background-color]="list.color"
              ></div>
              <span class="nav-label">{{ list.label }}</span>
              <span class="nav-count" *ngIf="list.count">{{ list.count }}</span>
            </li>
            <li class="nav-item add-item">
              <mat-icon class="nav-icon">add</mat-icon>
              <span class="nav-label">Add New List</span>
            </li>
          </ul>
        </div>

        <!-- Tags Section -->
        <div class="nav-section">
          <h3 class="section-title">TAGS</h3>
          <div class="tags-container">
            <span
              class="tag"
              [class.active]="isActiveFilter('tag', tag)"
              *ngFor="let tag of tags"
              (click)="onTagFilter(tag)"
              >{{ tag }}</span
            >
            <span class="add-tag">+ Add Tag</span>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="sidebar-bottom">
          <div class="nav-item" (click)="onSettingClick()">
            <mat-icon class="nav-icon">settings</mat-icon>
            <span class="nav-label">Settings</span>
          </div>
          <div class="nav-item">
            <mat-icon class="nav-icon">logout</mat-icon>
            <span class="nav-label">Sign out</span>
          </div>
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <!-- Settings Component Overlay -->
        <div class="settings-overlay" *ngIf="showSettings" (click)="closeSettings()">
          <div class="settings-wrapper" (click)="$event.stopPropagation()">
            <app-task-settings (close)="closeSettings()"></app-task-settings>
          </div>
        </div>
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidebar {
        width: 280px;
        background: #f8f9fa;
        padding: 0;
        border-right: 1px solid #e9ecef;
        height: 100%;
        display: flex;
        border-radius: 20px;
      }

      .sidebar mat-icon {
        margin-bottom: -9px;
      }

      .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 10px;
        padding: 16px 20px;
        border-bottom: 1px solid #e9ecef;
      }

      .sidebar-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: #343a40;
      }

      .sidebar-header button {
        background: transparent;
        border: none;
        color: #6c757d;
        cursor: pointer;
      }

      .search-section {
        padding: 16px 20px;
        border-bottom: 1px solid #e9ecef;
      }

      .search-input {
        display: flex;
        align-items: center;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 8px 12px;
      }

      .search-icon {
        color: #6c757d;
        margin-right: 8px;
        font-size: 18px;
      }

      .search-input input {
        border: none;
        outline: none;
        flex: 1;
        font-size: 14px;
        color: #495057;
      }

      .search-input input::placeholder {
        color: #6c757d;
      }

      .nav-section {
        padding: 16px 0;
        border-bottom: 1px solid #e9ecef;
      }

      .section-title {
        font-size: 11px;
        font-weight: 600;
        color: #6c757d;
        margin: 0 0 12px 20px;
        letter-spacing: 0.5px;
      }

      .nav-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .nav-item {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        padding: 12px 20px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin: 2px 8px;
        position: relative;
        overflow: hidden;
      }

      .nav-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        opacity: 0;
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 8px;
        z-index: -1;
      }

      .nav-item:hover {
        background-color: #e9ecef;
        transform: translateX(4px);
      }

      .nav-item.active::before {
        opacity: 1;
      }

      .nav-item.active {
        color: white;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        transform: translateX(4px);
      }

      .nav-item.active .nav-label {
        color: white;
        font-weight: 500;
      }

      .nav-item.active .nav-icon {
        color: white;
      }

      .nav-item.active .nav-count {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .nav-icon {
        font-size: 18px;
        color: #6c757d;
        padding: 0;
        margin: 0;
        margin-right: 12px;
        width: 18px;
      }

      .color-indicator {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        margin-right: 12px;
      }

      .nav-label {
        flex: 1;
        font-size: 14px;
        color: #495057;
      }

      .nav-count {
        font-size: 12px;
        color: #6c757d;
        background: #e9ecef;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 16px;
        text-align: center;
      }

      .add-item .nav-label {
        color: #6c757d;
      }

      .tags-container {
        padding: 0 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tag {
        background: #e9ecef;
        color: #495057;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;
        position: relative;
        overflow: hidden;
      }

      .tag::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
        opacity: 0;
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 16px;
        z-index: -1;
      }

      .tag:hover {
        background: #dee2e6;
        transform: translateY(-2px);
      }

      .tag.active::before {
        opacity: 1;
      }

      .tag.active {
        color: white;
        box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
        transform: translateY(-2px);
      }

      .add-tag {
        color: #6c757d;
        font-size: 12px;
        cursor: pointer;
      }

      .sidebar-bottom {
        margin-top: auto;
        padding: 16px 0;
      }

      .sidebar-bottom .nav-item {
        padding: 12px 20px;
      }

      mat-sidenav-container {
        height: 100vh;
      }

      .settings-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      }

      .settings-wrapper {
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
      }
    `,
  ],
  standalone: true,
  imports: [
    MatSidenav,
    MatSidenavContainer,
    CommonModule,
    MatSidenavContent,
    MatIcon,
    FormsModule,
    TaskSettingsComponent,
  ],
})
export class TaskNavigationComponent implements OnInit {
  @Output() filterChanged = new EventEmitter<{ type: string; value: any }>();

  searchTerm = '';
  activeFilter: { type: string; value: any } | null = null;
  showSettings = false;

  taskItems = [
    {
      icon: 'schedule',
      label: 'Upcoming',
      count: 0,
      filter: 'upcoming',
      disabled: false,
    },
    {
      icon: 'today',
      label: 'Today',
      count: 0,
      filter: 'today',
      disabled: false,
    },
    {
      icon: 'calendar_today',
      label: 'Calendar',
      filter: 'calendar',
      disabled: true,
    },
    {
      icon: 'push_pin',
      label: 'Sticky Wall',
      filter: 'sticky',
      disabled: true,
    },
  ];

  listItems = [
    {
      color: '#dc3545',
      label: 'Personal',
      count: 0,
      category: Category.Personal,
    },
    { color: '#0d6efd', label: 'Work', count: 0, category: Category.Work },
    { color: '#ffc107', label: 'Urgent', count: 0, category: Category.Urgent },
    { color: '#6c757d', label: 'Other', count: 0, category: Category.Other },
  ];

  tags: string[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.updateCounts();
    this.updateTags();

    // Subscribe to task changes to update counts
    this.taskService.tasks$.subscribe(() => {
      this.updateCounts();
      this.updateTags();
    });
  }

  private updateCounts() {
    const stats = this.taskService.getTaskStats();
    const todayTasks = this.taskService.getTodaysTasks();

    // Update task counts
    this.taskItems[0].count = stats.inProgress + stats.todo; // Upcoming
    this.taskItems[1].count = todayTasks.length; // Today

    // Update category counts
    this.listItems[0].count = this.taskService.getTasksByCategory(
      Category.Personal
    ).length;
    this.listItems[1].count = this.taskService.getTasksByCategory(
      Category.Work
    ).length;
    this.listItems[2].count = this.taskService.getTasksByCategory(
      Category.Urgent
    ).length;
    this.listItems[3].count = this.taskService.getTasksByCategory(
      Category.Other
    ).length;
  }

  private updateTags() {
    const allTasks = this.taskService.getActiveTasks();
    const tagSet = new Set<string>();

    allTasks.forEach((task) => {
      if (task.Tags) {
        task.Tags.forEach((tag) => tagSet.add(tag));
      }
    });

    this.tags = Array.from(tagSet);
  }

  onNavigationClick(filter: string) {
    this.activeFilter = { type: 'navigation', value: filter };
    this.filterChanged.emit({ type: 'navigation', value: filter });
  }
  onSettingClick() {
    this.showSettings = true;
  }

  closeSettings() {
    this.showSettings = false;
  }

  onCategoryFilter(category: Category) {
    this.activeFilter = { type: 'category', value: category };
    this.filterChanged.emit({ type: 'category', value: category });
  }

  onTagFilter(tag: string) {
    this.activeFilter = { type: 'tag', value: tag };
    this.filterChanged.emit({ type: 'tag', value: tag });
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.activeFilter = { type: 'search', value: this.searchTerm.trim() };
      this.filterChanged.emit({
        type: 'search',
        value: this.searchTerm.trim(),
      });
    } else {
      this.activeFilter = null;
      this.filterChanged.emit({ type: 'clear', value: null });
    }
  }

  isActiveFilter(type: string, value: any): boolean {
    return (
      this.activeFilter?.type === type && this.activeFilter?.value === value
    );
  }
}
