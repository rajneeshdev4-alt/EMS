const { z } = require('zod');
const { CATEGORIES, PAYMENT_METHODS, EXPENSE_STATUS } = require('../constants');

const createExpenseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.enum(CATEGORIES),
  date: z.coerce.date(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  description: z.string().trim().max(2000).optional().default(''),
});

const updateExpenseSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    amount: z.coerce.number().positive().optional(),
    category: z.enum(CATEGORIES).optional(),
    date: z.coerce.date().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).optional(),
    description: z.string().trim().max(2000).optional(),
    version: z.coerce.number().int().min(0).optional(),
  })
  .strict();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(200).optional(),
  status: z.enum(Object.values(EXPENSE_STATUS)).optional(),
  category: z.enum(CATEGORIES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt', 'title']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const rejectSchema = z.object({
  rejectionReason: z.string().trim().min(1, 'Rejection reason is required').max(1000),
});

const approveSchema = z.object({
  version: z.coerce.number().int().min(0).optional(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid expense id'),
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  listQuerySchema,
  rejectSchema,
  approveSchema,
  idParamSchema,
};