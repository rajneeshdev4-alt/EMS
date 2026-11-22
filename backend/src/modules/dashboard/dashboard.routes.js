const express = require('express');
const { authenticateUser } = require('../../middleware/authenticate');
const controller = require('./dashboard.controller');

const router = express.Router();

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard analytics summary
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *     responses:
 *       200: { description: Summary fetched }
 */
router.get('/summary', authenticateUser, controller.getSummary);

module.exports = router;