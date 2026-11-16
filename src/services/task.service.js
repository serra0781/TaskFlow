const config = require('../config');
const FileDb = require('../utils/fileDb');

const db = new FileDb(config.tasksFile);

const PRIORITY_ORDER = { low: 1, medium: 2, high: 3 };
const EDITABLE_FIELDS = ['title', 'description', 'status', 'priority', 'assignee', 'project', 'dueDate'];

function pick(source, fields) {
  return fields.reduce((acc, field) => {
    if (source[field] !== undefined) acc[field] = source[field];
    return acc;
  }, {});
}

function normalize(value) {
  return String(value ?? '').toLocaleLowerCase('tr-TR');
}

function compare(a, b, field) {
  if (field === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  const va = a[field];
  const vb = b[field];
  // Boş değerler (örn. dueDate olmayan görevler) her zaman sona gider.
  if (va == null && vb == null) return 0;
  if (va == null) return 1;
  if (vb == null) return -1;
  return String(va).localeCompare(String(vb), 'tr');
}

/**
 * Görev listesine filtre, arama, sıralama ve sayfalama uygular.
 */
function applyQuery(tasks, query = {}) {
  let result = [...tasks];

  if (query.status) result = result.filter((t) => t.status === query.status);
  if (query.priority) result = result.filter((t) => t.priority === query.priority);
  if (query.assignee) result = result.filter((t) => normalize(t.assignee) === normalize(query.assignee));
  if (query.project) result = result.filter((t) => normalize(t.project) === normalize(query.project));

  if (query.keyword) {
    const keyword = normalize(query.keyword);
    result = result.filter(
      (t) => normalize(t.title).includes(keyword) || normalize(t.description).includes(keyword)
    );
  }

  if (query.sort) {
    // "-createdAt" azalan, "createdAt" artan sıralama anlamına gelir.
    const desc = query.sort.startsWith('-');
    const field = desc ? query.sort.slice(1) : query.sort;
    const order = desc || query.order === 'desc' ? -1 : 1;
    result.sort((a, b) => compare(a, b, field) * order);
  }

  const total = result.length;

  if (query.page || query.limit) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const start = (page - 1) * limit;
    return {
      data: result.slice(start, start + limit),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  return { data: result, pagination: null };
}

const taskService = {
  findAll(query) {
    return applyQuery(db.read().tasks, query);
  },

  findById(id) {
    return db.read().tasks.find((t) => t.id === Number(id)) || null;
  },

  create(payload) {
    const store = db.read();
    const now = new Date().toISOString();
    const task = {
      id: store.lastId + 1,
      title: payload.title.trim(),
      description: payload.description?.trim() ?? '',
      status: payload.status || 'todo',
      priority: payload.priority || 'medium',
      assignee: payload.assignee?.trim() || null,
      project: payload.project?.trim() || null,
      dueDate: payload.dueDate || null,
      createdAt: now,
      updatedAt: now,
    };
    store.lastId = task.id;
    store.tasks.push(task);
    db.write(store);
    return task;
  },

  /**
   * PUT ve PATCH için ortak güncelleme. PUT'ta tüm alanlar zaten
   * validation middleware tarafından zorunlu tutulur.
   */
  update(id, payload) {
    const store = db.read();
    const index = store.tasks.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;

    const changes = pick(payload, EDITABLE_FIELDS);
    for (const key of ['title', 'description', 'assignee', 'project']) {
      if (typeof changes[key] === 'string') changes[key] = changes[key].trim();
    }

    const updated = {
      ...store.tasks[index],
      ...changes,
      id: store.tasks[index].id,
      createdAt: store.tasks[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    store.tasks[index] = updated;
    db.write(store);
    return updated;
  },

  remove(id) {
    const store = db.read();
    const index = store.tasks.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;
    const [removed] = store.tasks.splice(index, 1);
    db.write(store);
    return removed;
  },

  getAll() {
    return db.read().tasks;
  },
};

module.exports = taskService;
