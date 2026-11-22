const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
});

const EXPENSE_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const CATEGORIES = Object.freeze([
  'Travel',
  'Meals',
  'Office Supplies',
  'Software',
  'Hardware',
  'Training',
  'Marketing',
  'Utilities',
  'Other',
]);

const PAYMENT_METHODS = Object.freeze([
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI',
  'Other',
]);

const AUDIT_ACTIONS = Object.freeze({
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

module.exports = {
  ROLES,
  EXPENSE_STATUS,
  CATEGORIES,
  PAYMENT_METHODS,
  AUDIT_ACTIONS,
};