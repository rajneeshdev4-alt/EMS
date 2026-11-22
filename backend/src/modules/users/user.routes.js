const express = require('express');
const { authenticateUser } = require('../../middleware/authenticate');
const { authorizeRoles } = require('../../middleware/authorize');
const { ROLES } = require('../../constants');
const controller = require('./user.controller');

const router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin only)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Users fetched }
 *       403: { description: Forbidden }
 */
router.get('/', authenticateUser, authorizeRoles(ROLES.ADMIN), controller.list);

module.exports = router;