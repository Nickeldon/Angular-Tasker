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
            @for (task of taskItems; track $index) {
            <li
              class="nav-item"
              [class.active]="isActiveFilter('navigation', task.filter)"
              (click)="onNavigationClick(task.filter)"
              [class.disabled]="task.disabled"
            >
              <mat-icon class="nav-icon">{{ task.icon }}</mat-icon>
              <span class="nav-label">{{ task.label }}</span>
              <span class="nav-count" *ngIf="task.count">{{ task.count }}</span>
            </li>
            }
          </ul>
        </div>

        <!-- Lists Section -->
        <div class="nav-section">
          <h3 class="section-title">LISTS</h3>
          <ul class="nav-list">
            @for (elem of listItems; track $index) {
            <li
              class="nav-item"
              [class.active]="isActiveFilter('category', elem.category)"
              (click)="onCategoryFilterClick(elem.category)"
            >
              <div
                class="color-indicator"
                [style.background-color]="elem.color"
              ></div>
              <span class="nav-label">{{ elem.label }}</span>
              @if (elem.count) {
              <span class="nav-count" *ngIf="elem.count">{{ elem.count }}</span>
              }
            </li>
            }
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
            @for (tag of tags; track $index) {
            <span
              class="tag"
              [class.active]="isActiveFilter('tag', tag)"
              (click)="onTagFilterClick(tag)"
              >{{ tag }}</span
            >
            } @if(addTagSelected) {
            <input
              type="text"
              class="tag add-tag-input"
              style="width: min-content;"
              placeholder="Enter tag "
              (blur)="addTagSelected = false"
            />
          }
            <span class="add-tag" (click)="showAddTag()">+ Add Tag</span>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="sidebar-bottom">
          <div class="nav-item" (click)="showSettings = true">
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
        @if (showSettings) {
        <div class="settings-overlay" (click)="showSettings = false">
          <div class="settings-wrapper" (click)="$event.stopPropagation()">
            <app-task-settings
              (close)="showSettings = false"
            ></app-task-settings>
          </div>
        </div>
        }
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: ['./task.navigation.css'],
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
  // In order to send to an update attribute to the parent everytime a filter is pressed / added / changed
  @Output() filterChanged = new EventEmitter<{ type: string; value: any }>();

  searchTerm = ''; // To keep the search updated globally in the component
  activeFilter: { type: string; value: any } | null = null; // Which filter is pressed
  showSettings = false; // Boolean to know whether the settings should be displayed or not
  addTagSelected = false; // Boolean to know whether the add task button is selected or not

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
      // Optional, was just included to the design a chose, will be changed later
      icon: 'assignment_late',
      label: 'Overdue',
      filter: 'overdue',
      count: 0,
      disabled: false,
    },
    {
      // Optional, was just included to the design a chose, will be changed later
      icon: 'archive',
      label: 'Archived',
      filter: 'archived',
      count: 0,
      disabled: false,
    },
  ];

  listItems = [
    //prettier-ignore
    { color: '#dc3545', label: 'Personal', count: 0, category: Category.Personal },
    { color: '#0d6efd', label: 'Work', count: 0, category: Category.Work },
    { color: '#ffc107', label: 'Urgent', count: 0, category: Category.Urgent },
    { color: '#6c757d', label: 'Other', count: 0, category: Category.Other },
  ];

  tags: Set<string> = new Set(); // All tags from the tasks

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    // When the component is initialized
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
    const overdueTasks = this.taskService.getOverdueTasks();
    const archivedTasks = this.taskService.getArchivedTasks();

    // Update task counts
    this.taskItems[1].count = todayTasks.length; // Today
    this.taskItems[2].count = overdueTasks.length; // Overdue
    this.taskItems[0].count =
      stats.inProgress + stats.todo - todayTasks.length - overdueTasks.length; // Upcoming
    this.taskItems[3].count = archivedTasks.length; // Archived

    // Update category counts
    this.listItems.forEach((item, i) => {
      item.count = this.taskService.getTasksByCategory(item.category).length;
    });
  }

  private updateTags() {
    const allTasks = this.taskService.getActiveTasks();
    const tagSet = new Set<string>(); // To prevent duplicates

    allTasks.forEach((task) => {
      if (task.Tags) {
        // Go over all taks and add the tags to the set
        task.Tags.forEach((tag) => tagSet.add(tag));
      }
    });

    this.tags = tagSet; // update the tags array with unique tags
  }

  onNavigationClick(filter: string) {
    if (this.isActiveFilter('navigation', filter)) {
      console.log('Clearing filter');
      this.activeFilter = null; // Clear the filter if the same filter is clicked again
      this.filterChanged.emit({ type: 'clear', value: null });
      return;
    }
    this.activeFilter = { type: 'navigation', value: filter }; // Change filter
    this.filterChanged.emit({ type: 'navigation', value: filter }); // Call the parent (app.ts) that the filter has changed
  }

  onCategoryFilterClick(category: Category) {
    if (this.isActiveFilter('category', category)) {
      this.activeFilter = null; // Clear the filter if the same filter is clicked again
      this.filterChanged.emit({ type: 'clear', value: null });
      return;
    }
    this.activeFilter = { type: 'category', value: category }; // Change filter
    this.filterChanged.emit({ type: 'category', value: category }); // Call the parent (app.ts) that the filter has changed
  }

  onTagFilterClick(tag: string) {
    if (this.isActiveFilter('tag', tag)) {
      this.activeFilter = null; // Clear the filter if the same filter is clicked again
      this.filterChanged.emit({ type: 'clear', value: null });
      return;
    }
    this.activeFilter = { type: 'tag', value: tag }; // Change filter
    this.filterChanged.emit({ type: 'tag', value: tag }); // Call the parent (app.ts) that the filter has changed
  }

  showAddTag() {
    this.addTagSelected = !this.addTagSelected; // Toggle the add tag input visibility
    if (!this.addTagSelected) {
      this.filterChanged.emit({ type: 'clear', value: null }); // Clear the filter if the add tag input is closed
    } else {
      this.searchTerm = ''; // Clear the search term when adding a new tag
      this.activeFilter = null; // Clear any active filter
    }
  }

  onSearch() {
    const trimTerm = this.searchTerm.trim();
    if (trimTerm) {
      // Remove white space
      this.activeFilter = { type: 'search', value: trimTerm }; // Change the active filter
      this.filterChanged.emit({
        // Call the parent (app.ts) that the filter has changed (Will remove any previous filter)
        type: 'search',
        value: trimTerm,
      });
    } else {
      this.activeFilter = null;
      this.filterChanged.emit({ type: 'clear', value: null }); // If the input is empty, clear the filter
    }
  }

  isActiveFilter(type: 'navigation' | 'tag' | 'category', value: any): boolean {
    // Verify if filter x is active
    return (
      this.activeFilter?.type === type && this.activeFilter?.value === value
    );
  }
}
