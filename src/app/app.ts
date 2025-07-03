import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskSectionComponent } from './components/task-section/task-section';
import { TaskNavigationComponent } from './components/task-navigation/task-navigation';
import { Task, Category } from './components/task/task';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskSectionComponent, TaskNavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {
  protected title = 'firstApp';
  myTasks: Task[] = [];
  currentFilter: {type: string, value: any} | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    // Subscribe to tasks from the service - show only active tasks by default
    this.applyCurrentFilter();

    // Re-apply filter when tasks change
    this.taskService.tasks$.subscribe(() => {
      this.applyCurrentFilter();
    });
  }

  // Handle filter changes from navigation
  onFilterChanged(filter: {type: string, value: any}) {
    this.currentFilter = filter;
    this.applyCurrentFilter();
  }

  private applyCurrentFilter() {
    let filteredTasks: Task[] = [];

    if (!this.currentFilter) {
      // Default: show all active tasks
      filteredTasks = this.taskService.getActiveTasks();
    } else {
      switch (this.currentFilter.type) {
        case 'navigation':
          filteredTasks = this.getTasksByNavigation(this.currentFilter.value);
          break;
        case 'category':
          filteredTasks = this.taskService.getTasksByCategory(this.currentFilter.value);
          break;
        case 'tag':
          filteredTasks = this.taskService.getTasksByTags([this.currentFilter.value]);
          break;
        case 'search':
          filteredTasks = this.taskService.searchTasks(this.currentFilter.value);
          break;
        case 'clear':
          filteredTasks = this.taskService.getActiveTasks();
          break;
        default:
          filteredTasks = this.taskService.getActiveTasks();
      }
    }

    this.myTasks = filteredTasks;
  }

  private getTasksByNavigation(filter: string): Task[] {
    switch (filter) {
      case 'today':
        return this.taskService.getTodaysTasks();
      case 'upcoming':
        return this.taskService.getActiveTasks().filter(task => {
          const taskDate = new Date(task.dueDate);
          const today = new Date();
          return taskDate >= today;
        });
      case 'calendar':
      case 'sticky':
      default:
        return this.taskService.getActiveTasks();
    }
  }

  // Method to update tasks view - can be called from anywhere
  updateTasksView(newTasks: Task[]): void {
    this.taskService.updateTasksView(newTasks);
  }
}
