const taskService = require('../services/task.service');
const ApiError = require('../utils/ApiError');

function sendList(res, { data, pagination }) {
  const body = { success: true, count: data.length, data };
  if (pagination) body.pagination = pagination;
  res.json(body);
}

const taskController = {
  // GET /tasks  (status, priority, assignee, project, keyword, sort, order, page, limit)
  list(req, res) {
    sendList(res, taskService.findAll(req.query));
  },

  // GET /tasks/search?keyword=backend
  search(req, res, next) {
    const keyword = req.query.keyword?.trim();
    if (!keyword) return next(ApiError.badRequest('keyword parametresi zorunludur'));
    sendList(res, taskService.findAll({ ...req.query, keyword }));
  },

  // GET /tasks/assignee/:name
  listByAssignee(req, res) {
    sendList(res, taskService.findAll({ ...req.query, assignee: req.params.name }));
  },

  // GET /tasks/:id
  getById(req, res, next) {
    const task = taskService.findById(req.params.id);
    if (!task) return next(ApiError.notFound(`id=${req.params.id} olan görev bulunamadı`));
    res.json({ success: true, data: task });
  },

  // POST /tasks
  create(req, res) {
    const task = taskService.create(req.body);
    res.status(201).location(`/tasks/${task.id}`).json({ success: true, message: 'Görev oluşturuldu', data: task });
  },

  // PUT /tasks/:id  ve  PATCH /tasks/:id
  update(req, res, next) {
    const task = taskService.update(req.params.id, req.body);
    if (!task) return next(ApiError.notFound(`id=${req.params.id} olan görev bulunamadı`));
    res.json({ success: true, message: 'Görev güncellendi', data: task });
  },

  // DELETE /tasks/:id
  remove(req, res, next) {
    const task = taskService.remove(req.params.id);
    if (!task) return next(ApiError.notFound(`id=${req.params.id} olan görev bulunamadı`));
    res.json({ success: true, message: 'Görev silindi', data: task });
  },
};

module.exports = taskController;
