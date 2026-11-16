const reportService = require('../services/report.service');

const reportController = {
  // GET /reports/completed
  completed(req, res) {
    res.json({ success: true, data: reportService.completed() });
  },

  // GET /reports/pending
  pending(req, res) {
    res.json({ success: true, data: reportService.pending() });
  },

  // GET /reports/summary
  summary(req, res) {
    res.json({ success: true, data: reportService.summary() });
  },
};

module.exports = reportController;
