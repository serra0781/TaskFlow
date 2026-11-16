const express = require('express');
const taskRoutes = require('./task.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

// GET /  -> API hakkında kısa bilgi ve endpoint listesi
router.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'TaskFlow API',
    description: 'Görev ve Proje Yönetim Sistemi REST API',
    version: '1.0.0',
    endpoints: {
      tasks: [
        'GET    /tasks',
        'GET    /tasks/:id',
        'POST   /tasks',
        'PUT    /tasks/:id',
        'PATCH  /tasks/:id',
        'DELETE /tasks/:id',
        'GET    /tasks/search?keyword=...',
        'GET    /tasks/assignee/:name',
      ],
      reports: ['GET /reports/completed', 'GET /reports/pending', 'GET /reports/summary'],
      health: ['GET /health'],
    },
  });
});

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: Number(process.uptime().toFixed(2)) });
});

router.use('/tasks', taskRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
