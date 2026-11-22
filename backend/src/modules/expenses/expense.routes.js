const express = require('express');
const { authenticateUser } = require('../../middleware/authenticate');
const { authorizeRoles } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../constants');
const { csrfProtection } = require('../../middleware/csrf');
const {
  createExpenseSchema,
  updateExpenseSchema,
  listQuerySchema,
  rejectSchema,
  approveSchema,
  idParamSchema,
} = require('../../validators/expense.validator');
const controller = require('./expense.controller');

const router = express.Router();

router.use(authenticateUser);
router.use(csrfProtection); 

/**
 * @openapi
 * /expenses:
 *   get:
 *     tags: [Expenses]
 *     summary: List expenses with filters, pagination, sorting
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: paymentMethod
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [date, amount, createdAt, title], default: date }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200: { description: Expenses fetched }
 */
router.get('/', validate(listQuerySchema, 'query'), controller.list);

/**
 * @openapi
 * /expenses:
 *   post:
 *     tags: [Expenses]
 *     summary: Create expense
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, amount, category, date, paymentMethod]
 *             properties:
 *               title: { type: string }
 *               amount: { type: number }
 *               category: { type: string }
 *               date: { type: string, format: date-time }
 *               paymentMethod: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 */
router.post('/', validate(createExpenseSchema), controller.create);

/**
 * @openapi
 * /expenses/{id}:
 *   get:
 *     tags: [Expenses]
 *     summary: Get expense by id with audit history
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Expense fetched }
 *       404: { description: Not found }
 */
router.get('/:id', validate(idParamSchema, 'params'), controller.getOne);

/**
 * @openapi
 * /expenses/{id}:
 *   patch:
 *     tags: [Expenses]
 *     summary: Update own expense (pending/rejected only)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Updated }
 *       403: { description: Forbidden }
 *       409: { description: Version conflict }
 */
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateExpenseSchema),
  controller.update,
);

/**
 * @openapi
 * /expenses/{id}:
 *   delete:
 *     tags: [Expenses]
 *     summary: Soft-delete own expense
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);

/**
 * @openapi
 * /expenses/{id}/approve:
 *   post:
 *     tags: [Expenses]
 *     summary: Approve expense (admin only)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Approved }
 *       403: { description: Forbidden }
 *       409: { description: Conflict }
 */
router.post(
  '/:id/approve',
  authorizeRoles(ROLES.ADMIN),
  validate(idParamSchema, 'params'),
  validate(approveSchema),
  controller.approve,
);

/**
 * @openapi
 * /expenses/{id}/reject:
 *   post:
 *     tags: [Expenses]
 *     summary: Reject expense (admin only)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Rejected }
 *       403: { description: Forbidden }
 *       409: { description: Conflict }
 */
router.post(
  '/:id/reject',
  authorizeRoles(ROLES.ADMIN),
  validate(idParamSchema, 'params'),
  validate(rejectSchema),
  controller.reject,
);

module.exports = router;