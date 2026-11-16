const express = require('express');
const taskController = require('../controllers/task.controller');
const { validateTask, validateId, validateQuery } = require('../middlewares/validateTask');

const router = express.Router();

// Not: /search ve /assignee/:name rotaları /:id'den ÖNCE tanımlanmalı,
// aksi halde "search" kelimesi id olarak yorumlanır.
router.get('/search', validateQuery, taskController.search);
router.get('/assignee/:name', validateQuery, taskController.listByAssignee);

router
  .route('/')
  .get(validateQuery, taskController.list)
  .post(validateTask('create'), taskController.create);

router
  .route('/:id')
  .all(validateId)
  .get(taskController.getById)
  .put(validateTask('replace'), taskController.update)
  .patch(validateTask('partial'), taskController.update)
  .delete(taskController.remove);

module.exports = router;
