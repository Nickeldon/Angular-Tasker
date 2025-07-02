# Angular Tasker - Assessment Implementation

## Overview
This implementation follows the assessment guidelines for in-memory task storage using an Angular service with archived functionality.

## Key Changes Made

### 1. **Task Model Enhancement**
- **Added `archived: boolean` field** to the Task interface as required by guidelines
- All existing tasks now include the archived property

### 2. **In-Memory Storage Implementation**
- **TaskService** now serves as the single source of truth for all task data
- Uses **BehaviorSubject** for reactive state management
- **No backend required** - all data stored in memory as per guidelines

### 3. **Archive Functionality**
- **Archive/Unarchive Tasks**: Tasks can be archived instead of deleted
- **Filtered Views**: By default, only non-archived tasks are shown
- **Archive Management**: Archived tasks are maintained in memory but hidden from main view

## Features Implemented

### Core Task Management (In-Memory)
```typescript
// Main service methods
- getTasks(): Task[]                    // All tasks in memory
- getActiveTasks(): Task[]              // Non-archived tasks only
- getArchivedTasks(): Task[]            // Archived tasks only
- updateTasksView(tasks: Task[]): void  // Update entire task list
```

### CRUD Operations
```typescript
- addTask(task: Task): void             // Add new task (archived: false)
- deleteTask(taskId: number): void      // Permanently delete
- updateTask(updatedTask: Task): void   // Update existing task
- updateTaskStatus(id: number, status: Status): void
```

### Archive Operations
```typescript
- archiveTask(taskId: number): void     // Set archived: true
- unarchiveTask(taskId: number): void   // Set archived: false
```

### Filter & Search Operations
```typescript
- getTasksByCategory(category: Category, includeArchived?: boolean)
- getTasksByStatus(status: Status, includeArchived?: boolean)
- getTodaysTasks(includeArchived?: boolean)
- getTasksByTags(tags: string[], includeArchived?: boolean)
- searchTasks(searchTerm: string, includeArchived?: boolean)
```

### Statistics
```typescript
- getTaskStats(): {
    total: number,
    active: number,
    archived: number,
    completed: number,
    inProgress: number,
    todo: number
  }
```

## UI Enhancements

### Task Component
- **Archive Button**: Orange archive icon for active tasks
- **Unarchive Button**: Green unarchive icon for archived tasks
- **Visual Indicators**: Archived tasks have reduced opacity and "ARCHIVED" badge
- **Hover Effects**: Better UX with hover states

### Task Section Component
- **Form Enhancement**: Archive field included in new task creation
- **Event Handling**: Archive/unarchive events properly handled
- **Filtered Display**: Only shows active tasks by default

## Data Flow

```
TaskService (In-Memory Storage)
    ↓ (BehaviorSubject)
App Component
    ↓ (Input Binding)
TaskSection Component
    ↓ (Event Binding)
Task Component
```

## Sample Data Structure
```typescript
{
  id: 1,
  title: 'Buy groceries',
  status: Status['In-Progress'],
  category: Category.Personal,
  description: 'Get ingredients for dinner this week',
  dueDate: '2025-07-02',
  Tags: ['shopping', 'food'],
  archived: false  // ← Required field added
}
```

## Compliance with Guidelines

✅ **Data Storage**: Tasks stored in-memory using Angular service (no backend)  
✅ **Archived Field**: Boolean archived field added to task model  
✅ **Service-Based**: TaskService handles all data operations  
✅ **Reactive Updates**: BehaviorSubject ensures UI updates automatically  
✅ **No External Dependencies**: Pure Angular implementation  

## Usage Examples

```typescript
// In any component
constructor(private taskService: TaskService) {}

// Get active tasks only
const activeTasks = this.taskService.getActiveTasks();

// Archive a task
this.taskService.archiveTask(taskId);

// Get task statistics
const stats = this.taskService.getTaskStats();
// Returns: { total: 4, active: 3, archived: 1, completed: 1, ... }

// Search including archived tasks
const results = this.taskService.searchTasks('project', true);
```

This implementation provides a robust, in-memory task management system that meets all assessment requirements while maintaining good separation of concerns and reactive data flow.
