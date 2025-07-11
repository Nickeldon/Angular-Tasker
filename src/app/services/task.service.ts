import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, Status, Category } from '../components/task/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  // private hasInitialized = false;
  private readonly STORAGE_KEY = 'angular-tasker-tasks';

  // Observable for components to subscribe to
  public tasks$ = this.tasksSubject.asObservable();

  constructor() {
    this.loadTasksFromStorage();
  }

  // Load tasks from localStorage or initialize with defaults
  private loadTasksFromStorage(): void {
    try {
      const storedTasks = this.loadTasksFromLocalStorage();
      if (storedTasks.length > 0) {
        this.tasksSubject.next(storedTasks);
        // this.hasInitialized = true;
      } else {
        // No stored tasks, load default tasks
        // this.loadDefaultTasks();
      }
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      // this.loadDefaultTasks();
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
    // this.hasInitialized = true;
    // Save default tasks to localStorage
    this.saveTasksToLocalStorage(defaultTasks);
  }

  // Get current tasks value (in-memory storage)
  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  // Reload tasks from localStorage
  reloadTasksFromJson(): Observable<Task[]> {
    this.loadTasksFromStorage();
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
    // Save to localStorage only
    this.saveTasksToLocalStorage(newTasks);
  }

  // Save tasks to localStorage
  private saveTasksToLocalStorage(tasks: Task[]): void {
    try {
      const serializedTasks = JSON.stringify(tasks);
      localStorage.setItem(this.STORAGE_KEY, serializedTasks);
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  // Load tasks from localStorage
  private loadTasksFromLocalStorage(): Task[] {
    try {
      const serializedTasks = localStorage.getItem(this.STORAGE_KEY);
      if (serializedTasks) {
        const tasks = JSON.parse(serializedTasks);
        // Ensure proper enum mapping when loading from localStorage
        return tasks.map((task: any) => ({
          ...task,
          status:
            typeof task.status === 'string'
              ? this.mapStringToStatus(task.status)
              : task.status,
          category:
            typeof task.category === 'string'
              ? this.mapStringToCategory(task.category)
              : task.category,
        }));
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
    return [];
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
  private getStatusString(status: Status): string {
    switch (status) {
      case Status['To-do']:
        return 'To-do';
      case Status['In-Progress']:
        return 'In-Progress';
      case Status['Complete']:
        return 'Complete';
      default:
        return 'To-do';
    }
  }

  private getCategoryString(category: Category): string {
    switch (category) {
      case Category.Work:
        return 'Work';
      case Category.Personal:
        return 'Personal';
      case Category.Urgent:
        return 'Urgent';
      case Category.Other:
        return 'Other';
      default:
        return 'Personal';
    }
  }

  // Export tasks as JSON (for download)
  exportTasksAsJSON(): void {
    const tasks = this.getTasks();
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'tasks.json';
    link.click();

    URL.revokeObjectURL(link.href);
  }

  // Import tasks from JSON file
  importTasksFromJSON(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          const tasks: Task[] = jsonData.map((jsonTask: any) => ({
            id: jsonTask.id,
            title: jsonTask.title,
            description: jsonTask.description,
            status: this.mapStringToStatus(jsonTask.status),
            category: this.mapStringToCategory(jsonTask.category),
            dueDate: jsonTask.dueDate,
            Tags: jsonTask.Tags || [],
            archived: jsonTask.archived || false,
          }));
          this.updateTasksView(tasks);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
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

  getOverdueTasks(includeArchived: boolean = false): Task[] {
    const today = new Date().toISOString().split('T')[0];
    const tasks = includeArchived ? this.getTasks() : this.getActiveTasks();
    return tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date(today) && !task.archived;
    });
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

  // Clear all tasks and localStorage
  clearAllTasks(): void {
    this.updateTasksView([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Reset to default data
  resetToOriginalData(): void {
    // this.hasInitialized = false;
    localStorage.removeItem(this.STORAGE_KEY);
    this.loadTasksFromStorage();
  }
}
