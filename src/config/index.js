const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  // Görevlerin saklandığı JSON dosyası. Testlerde farklı bir dosya kullanmak için
  // TASKS_FILE ortam değişkeni ile değiştirilebilir.
  tasksFile: process.env.TASKS_FILE || path.join(ROOT_DIR, 'data', 'tasks.json'),
  logFile: process.env.LOG_FILE || path.join(ROOT_DIR, 'logs', 'requests.log'),
  // Testlerde konsolu kirletmemek için loglama kapatılabilir.
  logToConsole: process.env.LOG_TO_CONSOLE !== 'false',

  TASK_STATUSES: ['todo', 'in-progress', 'completed'],
  TASK_PRIORITIES: ['low', 'medium', 'high'],
  SORTABLE_FIELDS: ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title', 'status'],
};
