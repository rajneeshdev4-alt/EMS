const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../../constants');

const auditLogSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
    },
    action: { type: String, enum: Object.values(AUDIT_ACTIONS), required: true },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousData: { type: Object, default: null },
    newData: { type: Object, default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ expenseId: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;