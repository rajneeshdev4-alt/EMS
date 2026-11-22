const mongoose = require('mongoose');
const { EXPENSE_STATUS, CATEGORIES, PAYMENT_METHODS } = require('../../constants');

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, enum: CATEGORIES },
    date: { type: Date, required: true },
    paymentMethod: { type: String, required: true, enum: PAYMENT_METHODS },
    description: { type: String, default: '', maxlength: 2000 },
    status: {
      type: String,
      enum: Object.values(EXPENSE_STATUS),
      default: EXPENSE_STATUS.PENDING,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null, maxlength: 1000 },
    version: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Indexes for common query patterns
expenseSchema.index({ createdBy: 1, date: -1 });
expenseSchema.index({ status: 1, date: -1 });
expenseSchema.index({ category: 1, date: -1 });
expenseSchema.index({ isDeleted: 1 });
expenseSchema.index({ createdBy: 1, isDeleted: 1, date: -1 });
expenseSchema.index({ status: 1, isDeleted: 1, date: -1 });
expenseSchema.index({ isDeleted: 1, status: 1, date: -1 });
expenseSchema.index({ title: 'text', description: 'text' });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;