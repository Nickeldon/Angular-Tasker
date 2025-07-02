const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, 'tasks.json');

export enum Status {
  'To-do',
  'In-Progress',
  'Complete',
}

export enum Category {
  'Work',
  'Personal',
  'Urgent',
  'Other',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: Status;
  dueDate: string;
  Tags: string[] | undefined;
  category: Category;
}

type TaskFilters = {
  tags?: string[] | string;
  date?: string;
  startDate?: string;
  endDate?: string;
  category?: Category | string;
  status?: Status | string;
  search?: string;
};

const readFromFile = (pathLocation) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
};

const writeToFile = (tasks) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing tasks file:', error);
    return false;
  }
};

const filterByTasks = (tasks: Task[], filters: TaskFilters) => {
  let filteredTasks = [...tasks];

  if (filters.tags != undefined) {
    const tagsArray = Array.isArray(filters.tags)
      ? filters.tags
      : filters.tags.split(',');
    filteredTasks = filteredTasks.filter((task: Task) =>
      tagsArray.some(
        (tag: string) =>
          Array.isArray(task.Tags) &&
          task.Tags.some((taskTag: string) =>
            taskTag.toLowerCase().includes(tag.toLowerCase())
          )
      )
    );
  }

  if (filters.date) {
    filteredTasks = filteredTasks.filter(
      (task) => task.dueDate === filters.date
    );
  }

  if (
    typeof filters.startDate === 'string' &&
    typeof filters.endDate === 'string'
  ) {
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.dueDate >= filters.startDate! && task.dueDate <= filters.endDate!
    );
  }

  if (filters.category) {
    filteredTasks = filteredTasks.filter(
      (task) =>
        String(task.category).toLowerCase() ===
        String(filters.category).toLowerCase()
    );
  }

  if (filters.status) {
    filteredTasks = filteredTasks.filter((task) => {
      const taskStatus = Status[task.status];
      return (
        String(taskStatus.toLowerCase()) ===
        String(filters.status).toLowerCase()
      );
    });
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return filteredTasks;
};

app.get('/api/tasks', (req: any, res: any) => {
  try {
    const tasks = readFromFile(DATA_DIR);
    const filters = req.query;

    const filteredTasks = filterByTasks(tasks, filters);

    res.json({
      success: true,
      data: filteredTasks,
      total: filteredTasks.length,
      filters: filters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
});

app.get('/api/tasks/:id', (req: any, res: any) => {
  try {
    const tasks = readFromFile(DATA_DIR);
    const taskId = parseInt(req.params.id);
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message,
    });
  }
});

// POST /api/tasks - Add a new task
app.post('/api/tasks', (req: any, res: any) => {
  try {
    const tasks = readFromFile(DATA_DIR);
    const newTask = req.body;

    // Generate new ID
    const maxId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) : 0;
    newTask.id = maxId + 1;

    // Add timestamp
    newTask.createdAt = new Date().toISOString();

    tasks.push(newTask);

    if (writeToFile(tasks)) {
      res.status(201).json({
        success: true,
        data: newTask,
        message: 'Created task!',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error saving task',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message,
    });
  }
});

// PUT /api/tasks/:id - Update a task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readFromFile(DATA_DIR);
    const taskId = parseInt(req.params.id);
    const updatedTaskData = req.body;

    const taskIndex = tasks.getTaskByIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Update the task
    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTaskData, id: taskId };
    tasks[taskIndex].updatedAt = new Date().toISOString();

    if (writeToFile(tasks)) {
      res.json({
        success: true,
        data: tasks[taskIndex],
        message: 'Task updated successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error saving task',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req:any, res:any) => {
  try {
    const tasks = readFromFile(DATA_DIR);
    const taskId = parseInt(req.params.id);

    const taskIndex = tasks.getTaskByIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    tasks.splice(taskIndex, 1);

    if (writeToFile(tasks)) {
      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error saving tasks',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
});

// GET /api/tasks/filter/today - Get today's tasks
app.get('/api/tasks/filter/today', (req, res) => {
  try {
    const tasks = readFromFile(DATA_DIR);
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((task) => task.dueDate === today);

    res.json({
      success: true,
      data: todayTasks,
      total: todayTasks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching today's tasks",
      error: error.message,
    });
  }
});

// GET /api/tasks/filter/upcoming - Get upcoming tasks (next 7 days)
app.get('/api/tasks/filter/upcoming', (req, res) => {
  try {
    const tasks = readFromFile(DATA_DIR);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= today && taskDate <= nextWeek;
    });

    res.json({
      success: true,
      data: upcomingTasks,
      total: upcomingTasks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming tasks',
      error: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Angular Tasker Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Angular Tasker Backend running on http://localhost:${PORT}`);
  console.log(
    `📋 API endpoints available at http://localhost:${PORT}/api/tasks`
  );
});

module.exports = app;
