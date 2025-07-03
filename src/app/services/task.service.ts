import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task, Status, Category } from '../components/task/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  // Observable for components to subscribe to
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTasksFromJson();
  }

  // Load tasks from JSON file
  private loadTasksFromJson(): void {
    // Use ES6 dynamic import to load JSON file
    import('./../../assets/tasks.json')
      .then((json) => {
        const jsonTasks = json.default || json;
        const tasks: Task[] = jsonTasks.map((jsonTask: any) => ({
          id: jsonTask.id,
          title: jsonTask.title,
          description: jsonTask.description,
          status: this.mapStringToStatus(jsonTask.status),
          category: this.mapStringToCategory(jsonTask.category),
          dueDate: jsonTask.dueDate,
          Tags: jsonTask.Tags || [],
          archived: jsonTask.archived || false,
        }));
        this.tasksSubject.next(tasks);
      })
      .catch((error) => {
        // If the file is not found or there's an error, log it
        console.error('Error loading tasks from JSON:', error);
        // Fallback to default tasks if JSON loading fails (Defualt content for testing)
        this.loadDefaultTasks();
      });
  }

  // Map string status to enum
  private mapStringToStatus(statusString: string): Status {
    switch (statusString) {
      case 'To-do':
        return Status['To-do'];
      case 'In-Progress':
        return Status['In-Progress'];
      case 'Complete':
        return Status['Complete'];
      default:
        return Status['To-do'];
    }
  }

  // Map string category to enum
  private mapStringToCategory(categoryString: string): Category {
    switch (categoryString) {
      case 'Work':
        return Category.Work;
      case 'Personal':
        return Category.Personal;
      case 'Urgent':
        return Category.Urgent;
      case 'Other':
        return Category.Other;
      default:
        return Category.Personal;
    }
  }

  // Fallback method to load default tasks
  private loadDefaultTasks(): void {
    const defaultTasks: Task[] = [
      {
        id: 1,
        title: 'Buy groceries',
        status: Status['In-Progress'],
        category: Category.Personal,
        description: 'Get ingredients for dinner this week',
        dueDate: '2025-07-02',
        Tags: ['shopping', 'food'],
        archived: false,
      },
      {
        id: 2,
        title: 'Walk the dog',
        status: Status['To-do'],
        category: Category.Personal,
        description: 'Morning walk in the park',
        dueDate: '2025-07-02',
        Tags: ['exercise', 'pet'],
        archived: false,
      },
      {
        id: 3,
        title: 'Complete project report',
        status: Status['In-Progress'],
        category: Category.Work,
        description: 'Finish quarterly report for management',
        dueDate: '2025-07-05',
        Tags: ['work', 'report'],
        archived: false,
      },
      {
        id: 4,
        title: 'Old completed task',
        status: Status['Complete'],
        category: Category.Work,
        description: 'This is an archived task',
        dueDate: '2025-06-28',
        Tags: ['archived', 'old'],
        archived: true,
      },
    ];
    this.tasksSubject.next(defaultTasks);
  }

  // Get current tasks value (in-memory storage)
  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  // Reload tasks from JSON file
  reloadTasksFromJson(): Observable<Task[]> {
    this.loadTasksFromJson();
    return this.tasks$;
  }

  // Get only non-archived tasks
  getActiveTasks(): Task[] {
    return this.getTasks().filter((task) => !task.archived);
  }

  // Get only archived tasks
  getArchivedTasks(): Task[] {
    return this.getTasks().filter((task) => task.archived);
  }

  // Update tasks view - this is your UpdateTasksView method
  updateTasksView(newTasks: Task[]): void {
    this.tasksSubject.next(newTasks);
  }

  // Add a new task
  addTask(task: Task): void {
    const currentTasks = this.getTasks();
    const newTask = { ...task, archived: false }; // Ensure new tasks are not archived
    const updatedTasks = [newTask, ...currentTasks];
    this.updateTasksView(updatedTasks);
  }

  // Delete a task (permanently remove from memory)
  deleteTask(taskId: number): void {
    const currentTasks = this.getTasks();
    const updatedTasks = currentTasks.filter((task) => task.id !== taskId);
    this.updateTasksView(updatedTasks);
  }

  // Archive a task (set archived to true)
  archiveTask(taskId: number): void {
    const currentTasks = this.getTasks();
    const updatedTasks = currentTasks.map((task) =>
      task.id === taskId ? { ...task, archived: true } : task
    );
    this.updateTasksView(updatedTasks);
  }

  // Unarchive a task (set archived to false)
  unarchiveTask(taskId: number): void {
    const currentTasks = this.getTasks();
    const updatedTasks = currentTasks.map((task) =>
      task.id === taskId ? { ...task, archived: false } : task
    );
    this.updateTasksView(updatedTasks);
  }

  // Update task status
  updateTaskStatus(taskId: number, status: Status): void {
    const currentTasks = this.getTasks();
    const updatedTasks = currentTasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    );
    this.updateTasksView(updatedTasks);
  }

  // Update an entire task
  updateTask(updatedTask: Task): void {
    const currentTasks = this.getTasks();
    const updatedTasks = currentTasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    this.updateTasksView(updatedTasks);
  }

  // Generate new ID for tasks
  generateId(): number {
    const currentTasks = this.getTasks();
    return Math.max(...currentTasks.map((t) => t.id), 0) + 1;
  }

  // Filter tasks by category (excluding archived by default)
  getTasksByCategory(
    category: Category,
    includeArchived: boolean = false
  ): Task[] {
    const tasks = includeArchived ? this.getTasks() : this.getActiveTasks();
    return tasks.filter((task) => task.category === category);
  }

  // Filter tasks by status (excluding archived by default)
  getTasksByStatus(status: Status, includeArchived: boolean = false): Task[] {
    const tasks = includeArchived ? this.getTasks() : this.getActiveTasks();
    return tasks.filter((task) => task.status === status);
  }

  // Get tasks for today (excluding archived by default)
  getTodaysTasks(includeArchived: boolean = false): Task[] {
    const today = new Date().toISOString().split('T')[0];
    const tasks = includeArchived ? this.getTasks() : this.getActiveTasks();
    return tasks.filter((task) => task.dueDate === today);
  }

  // Get tasks by tags (excluding archived by default)
  getTasksByTags(tags: string[], includeArchived: boolean = false): Task[] {
    const tasks = includeArchived ? this.getTasks() : this.getActiveTasks();
    return tasks.filter(
      (task) =>
        task.Tags &&
        task.Tags.some((tag) =>
          tags.some((searchTag) =>
            tag.toLowerCase().includes(searchTag.toLowerCase())
          )
        )
    );
  }

  // Search tasks by title or description (excluding archived by default)
  searchTasks(searchTerm: string, includeArchived: boolean = false): Task[] {
    const tasks = includeArchived ? this.getTasks() : this.getActiveTasks();
    const term = searchTerm.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
    );
  }

  // Get task statistics
  getTaskStats() {
    const allTasks = this.getTasks();
    const activeTasks = this.getActiveTasks();
    const archivedTasks = this.getArchivedTasks();

    return {
      total: allTasks.length,
      active: activeTasks.length,
      archived: archivedTasks.length,
      completed: activeTasks.filter((t) => t.status === Status.Complete).length,
      inProgress: activeTasks.filter((t) => t.status === Status['In-Progress'])
        .length,
      todo: activeTasks.filter((t) => t.status === Status['To-do']).length,
    };
  }
}
