import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskSectionComponent } from './components/task-section/task-section';
import { TaskNavigationComponent } from './components/task-navigation/task-navigation';
import { Task } from './components/task/task';
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

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    // Subscribe to tasks from the service - show only active tasks by default
    this.taskService.tasks$.subscribe(tasks => {
      this.myTasks = tasks.filter(task => !task.archived); // Only show non-archived tasks
    });
  }

  // Method to update tasks view - can be called from anywhere
  updateTasksView(newTasks: Task[]): void {
    this.taskService.updateTasksView(newTasks);
  }
}
