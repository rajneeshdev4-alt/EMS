const AuditLog = require('./auditLog.model');

async function record(entry, session = null) {
  const [doc] = await AuditLog.create([entry], session ? { session } : {});
  return doc;
}

async function listForExpense(expenseId) {
  return AuditLog.find({ expenseId })
    .sort({ createdAt: -1 })
    .populate('performedBy', 'name email role')
    .lean();
}

module.exports = { record, listForExpense };