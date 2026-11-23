const express = require('express');
const { validate } = require('../../middleware/validate');
const { authenticateUser } = require('../../middleware/authenticate');
const { authLimiter } = require('../../middleware/rateLimiter');
const { loginSchema } = require('../../validators/auth.validator');
const controller = require('./auth.controller');

const router = express.Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@example.com }
 *               password: { type: string, example: Admin@123 }
 *     responses:
 *       200: { description: Login successful }
 *       400: { description: Validation error }
 *       401: { description: Invalid credentials }
 *       429: { description: Too many attempts }
 */
router.post('/login', authLimiter, validate(loginSchema), controller.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     responses:
 *       200: { description: Logout successful }
 */
router.post('/logout', controller.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Profile fetched }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticateUser, controller.me);
router.post('/register', authLimiter, controller.register);

module.exports = router;