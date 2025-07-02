import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskSectionComponent } from './components/task-section/task-section';
import { TaskNavigationComponent } from './components/task-navigation/task-navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskSectionComponent, TaskNavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'firstApp';
}
