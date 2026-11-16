const config = require('../config');
const ApiError = require('../utils/ApiError');

const RULES = {
  title: (v) => {
    if (typeof v !== 'string' || !v.trim()) return 'title zorunludur ve boş olamaz';
    if (v.trim().length < 3 || v.trim().length > 100) return 'title 3-100 karakter arasında olmalıdır';
    return null;
  },
  description: (v) => {
    if (typeof v !== 'string') return 'description metin (string) olmalıdır';
    if (v.length > 1000) return 'description en fazla 1000 karakter olabilir';
    return null;
  },
  status: (v) =>
    config.TASK_STATUSES.includes(v) ? null : `status şunlardan biri olmalıdır: ${config.TASK_STATUSES.join(', ')}`,
  priority: (v) =>
    config.TASK_PRIORITIES.includes(v)
      ? null
      : `priority şunlardan biri olmalıdır: ${config.TASK_PRIORITIES.join(', ')}`,
  assignee: (v) => {
    if (v === null) return null;
    if (typeof v !== 'string' || !v.trim()) return 'assignee boş olmayan bir metin olmalıdır';
    if (v.trim().length > 50) return 'assignee en fazla 50 karakter olabilir';
    return null;
  },
  project: (v) => {
    if (v === null) return null;
    if (typeof v !== 'string' || !v.trim()) return 'project boş olmayan bir metin olmalıdır';
    return null;
  },
  dueDate: (v) => {
    if (v === null) return null;
    if (typeof v !== 'string' || Number.isNaN(Date.parse(v))) return 'dueDate geçerli bir tarih olmalıdır (örn. 2026-12-31)';
    return null;
  },
};

const ALLOWED_FIELDS = Object.keys(RULES);
// POST'ta zorunlu alanlar
const REQUIRED_ON_CREATE = ['title', 'description', 'priority', 'assignee'];
// PUT tüm kaynağı değiştirdiği için temel alanların hepsi zorunlu
const REQUIRED_ON_REPLACE = ['title', 'description', 'status', 'priority', 'assignee'];

/**
 * Validation Middleware üreticisi.
 * mode: 'create' (POST) | 'replace' (PUT) | 'partial' (PATCH)
 */
function validateTask(mode = 'create') {
  return (req, res, next) => {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return next(ApiError.badRequest('İstek gövdesi geçerli bir JSON nesnesi olmalıdır'));
    }

    const errors = [];

    const unknown = Object.keys(body).filter((k) => !ALLOWED_FIELDS.includes(k));
    if (unknown.length) {
      errors.push({ field: unknown.join(', '), message: 'Tanımsız alan(lar) gönderildi' });
    }

    const required = mode === 'create' ? REQUIRED_ON_CREATE : mode === 'replace' ? REQUIRED_ON_REPLACE : [];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        errors.push({ field, message: `${field} alanı zorunludur` });
      }
    }

    if (mode === 'partial' && Object.keys(body).length === 0) {
      errors.push({ field: null, message: 'Güncellenecek en az bir alan gönderilmelidir' });
    }

    for (const field of ALLOWED_FIELDS) {
      if (body[field] === undefined) continue;
      if (errors.some((e) => e.field === field)) continue;
      const message = RULES[field](body[field]);
      if (message) errors.push({ field, message });
    }

    if (errors.length) return next(ApiError.badRequest('Doğrulama hatası', errors));
    next();
  };
}

/** :id parametresinin pozitif tam sayı olduğunu kontrol eder. */
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(ApiError.badRequest('id pozitif bir tam sayı olmalıdır'));
  }
  next();
}

/** Listeleme sorgu parametrelerini doğrular. */
function validateQuery(req, res, next) {
  const { status, priority, sort, order, page, limit } = req.query;
  const errors = [];

  if (status && !config.TASK_STATUSES.includes(status)) {
    errors.push({ field: 'status', message: `status şunlardan biri olmalıdır: ${config.TASK_STATUSES.join(', ')}` });
  }
  if (priority && !config.TASK_PRIORITIES.includes(priority)) {
    errors.push({ field: 'priority', message: `priority şunlardan biri olmalıdır: ${config.TASK_PRIORITIES.join(', ')}` });
  }
  if (sort) {
    const field = sort.startsWith('-') ? sort.slice(1) : sort;
    if (!config.SORTABLE_FIELDS.includes(field)) {
      errors.push({ field: 'sort', message: `sort şunlardan biri olmalıdır: ${config.SORTABLE_FIELDS.join(', ')}` });
    }
  }
  if (order && !['asc', 'desc'].includes(order)) {
    errors.push({ field: 'order', message: 'order asc veya desc olmalıdır' });
  }
  for (const [name, value] of [['page', page], ['limit', limit]]) {
    if (value !== undefined && (!/^\d+$/.test(value) || Number(value) < 1)) {
      errors.push({ field: name, message: `${name} pozitif bir tam sayı olmalıdır` });
    }
  }
  if (limit && Number(limit) > 100) {
    errors.push({ field: 'limit', message: 'limit en fazla 100 olabilir' });
  }

  if (errors.length) return next(ApiError.badRequest('Geçersiz sorgu parametresi', errors));
  next();
}

module.exports = { validateTask, validateId, validateQuery };
