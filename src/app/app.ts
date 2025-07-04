import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskSectionComponent } from './components/task-section/task.section';
import { TaskNavigationComponent } from './components/task-navigation/task.navigation';
import { Task, Category } from './components/task/task';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskSectionComponent, TaskNavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'Angular Tasker';

  // Intialize task object
  myTasks: Task[] = [];
  // Create a current filter in order to verify which filter is applied at any moment in the code. This will soon be stored in a config.json file
  currentFilter: { type: string; value: any } | null = null;

  constructor(private taskService: TaskService) {}

  // When Angular loads the page data + assets
  ngOnInit() {
    console.log(window.localStorage)
    // Filter the tasks based on the current filter. As there are no config.json files yet, it will always default to showing all active tasks
    this.applyCurrentFilter();

    // Re-apply filter when tasks change (Based on online sources)
    this.taskService.tasks$.subscribe(() => {
      this.applyCurrentFilter();
    });
  }

  // Class Methods

  // Handle filter changes from navigation
  onFilterChanged(filter: { type: string; value: any }) {
    console.log('Filter changed:', filter);
    this.currentFilter = filter;
    this.applyCurrentFilter();
  }

  // Filter tasks based on the current filter
  private applyCurrentFilter() {
    let filteredTasks: Task[] = [];

    if (!this.currentFilter) {
      // If the app was loaded for the first time or no filter is applied or no config.json file
      // Default: show all active tasks
      filteredTasks = this.taskService.getActiveTasks();
    } else {
      // Valid filter is applied

      // Could be simplified...?
      switch (this.currentFilter.type) {
        case 'navigation':
          filteredTasks = this.getTasksByNavigation(this.currentFilter.value);
          break;
        case 'category':
          filteredTasks = this.taskService.getTasksByCategory(
            this.currentFilter.value
          );
          break;
        case 'tag':
          filteredTasks = this.taskService.getTasksByTags([
            this.currentFilter.value,
          ]);
          break;
        case 'search':
          filteredTasks = this.taskService.searchTasks(
            this.currentFilter.value
          );
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

  // Return tasks based on the navigation filter
  private getTasksByNavigation(filter: string): Task[] {
    switch (filter) {
      case 'today': // Return tasks due today (With date match with today's date (in local timezone))
        return this.taskService.getTodaysTasks();
      case 'upcoming': // Basically the rest of upper's condition
        return this.taskService.getActiveTasks().filter((task) => {
          const taskDate = new Date(task.dueDate);
          const today = new Date();
          return taskDate >= today;
        });
      case 'overdue': {
        // Return tasks that are overdue (With date match with today's date (in local timezone))
        return this.taskService.getOverdueTasks();
      }
      case 'archived': {
        // Return archived tasks
        return this.taskService.getArchivedTasks();
      } // Does nothing, as this feature is not implemented yet
      default:
        return this.taskService.getActiveTasks();
    }
  }

  // Method to update tasks view - can be called from anywhere
  updateTasksView(newTasks: Task[]): void {
    this.taskService.updateTasksView(newTasks);
  }
}
