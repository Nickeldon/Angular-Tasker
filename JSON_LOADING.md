# Task Loading from JSON

## Implementation Details

The TaskService now loads initial task data from `src/assets/tasks.json` file on service initialization.

### Features Added:

1. **JSON File Loading**: Tasks are loaded from `assets/tasks.json` on service startup
2. **Error Handling**: Falls back to default tasks if JSON loading fails
3. **Type Mapping**: Converts string values from JSON to proper enums
4. **Reload Method**: `reloadTasksFromJson()` method to refresh data from file

### JSON Structure:
```json
{
  "id": number,
  "title": string,
  "status": "To-do" | "In-Progress" | "Complete",
  "category": "Work" | "Personal" | "Urgent" | "Other", 
  "description": string,
  "dueDate": "YYYY-MM-DD",
  "Tags": string[],
  "archived": boolean
}
```

### Usage:
- Tasks are automatically loaded when the service is initialized
- Data is loaded into memory and remains there (following assessment guidelines)
- Use `taskService.reloadTasksFromJson()` to refresh from file if needed

### Error Handling:
- If JSON file cannot be loaded, fallback default tasks are used
- Console error logged for debugging
- Service continues to work normally with default data

This maintains the in-memory storage requirement while allowing initial data to be loaded from a JSON file.
