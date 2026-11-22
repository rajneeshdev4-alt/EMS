export const ROLES = { ADMIN: 'admin', USER: 'user' } as const;
export const STATUS = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' } as const;

export const CATEGORIES = [
  'Travel', 'Meals', 'Office Supplies', 'Software', 'Hardware',
  'Training', 'Marketing', 'Utilities', 'Other'
] as const;

export const PAYMENT_METHODS = [
  'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other'
] as const;