import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSidenavContent } from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';

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
            <input type="text" placeholder="Search" />
          </div>
        </div>

        <!-- Tasks Section -->
        <div class="nav-section">
          <h3 class="section-title">TASKS</h3>
          <ul class="nav-list">
            <li class="nav-item" *ngFor="let task of taskItems">
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
            <li class="nav-item" *ngFor="let list of listItems">
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
            <span class="tag" *ngFor="let tag of tags">{{ tag }}</span>
            <span class="add-tag">+ Add Tag</span>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="sidebar-bottom">
          <div class="nav-item">
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
        height: 100vh;
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
        border-radius: 4px;
        padding: 10px 20px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .nav-item:hover {
        background-color: #e9ecef;
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
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        cursor: pointer;
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
    `,
  ],
  standalone: true,
  imports: [
    MatSidenav,
    MatSidenavContainer,
    CommonModule,
    MatSidenavContent,
    MatIcon,
    MatButton,
  ],
})
export class TaskNavigationComponent {
  taskItems = [
    { icon: 'schedule', label: 'Upcoming', count: 12 },
    { icon: 'today', label: 'Today', count: 5 },
    { icon: 'calendar_today', label: 'Calendar' },
    { icon: 'push_pin', label: 'Sticky Wall' },
  ];

  listItems = [
    { color: '#dc3545', label: 'Personal', count: 5 },
    { color: '#0d6efd', label: 'Work', count: 6 },
    { color: '#ffc107', label: 'List 1', count: 3 },
  ];

  tags = ['Tag 1', 'Tag 2'];
}
