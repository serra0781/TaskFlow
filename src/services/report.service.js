const config = require('../config');
const taskService = require('./task.service');

function countBy(tasks, field, keys) {
  const counts = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const task of tasks) {
    const key = task[field] ?? 'atanmamış';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function isOverdue(task, now) {
  return task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < now;
}

const reportService = {
  completed() {
    const tasks = taskService.getAll().filter((t) => t.status === 'completed');
    return { count: tasks.length, tasks };
  },

  pending() {
    // "Bekleyen" = henüz tamamlanmamış (todo + in-progress) görevler.
    const tasks = taskService.getAll().filter((t) => t.status !== 'completed');
    return {
      count: tasks.length,
      byStatus: countBy(tasks, 'status', ['todo', 'in-progress']),
      tasks,
    };
  },

  summary() {
    const tasks = taskService.getAll();
    const now = new Date();
    const completed = tasks.filter((t) => t.status === 'completed').length;

    return {
      totalTasks: tasks.length,
      completed,
      pending: tasks.length - completed,
      completionRate: tasks.length ? Number(((completed / tasks.length) * 100).toFixed(1)) : 0,
      overdue: tasks.filter((t) => isOverdue(t, now)).length,
      byStatus: countBy(tasks, 'status', config.TASK_STATUSES),
      byPriority: countBy(tasks, 'priority', config.TASK_PRIORITIES),
      byAssignee: countBy(tasks, 'assignee', []),
      byProject: countBy(tasks, 'project', []),
      generatedAt: now.toISOString(),
    };
  },
};

module.exports = reportService;
