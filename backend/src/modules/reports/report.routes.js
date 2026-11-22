const express = require('express');
const { authenticateUser } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { listQuerySchema } = require('../../validators/expense.validator');
const controller = require('./report.controller');

const router = express.Router();

/**
 * @openapi
 * /reports/expenses/export:
 *   get:
 *     tags: [Reports]
 *     summary: Export expenses to CSV with filters
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema: { type: string, format: binary }
 */
router.get(
  '/expenses/export',
  authenticateUser,
  validate(listQuerySchema, 'query'),
  controller.exportExpenses,
);

module.exports = router;