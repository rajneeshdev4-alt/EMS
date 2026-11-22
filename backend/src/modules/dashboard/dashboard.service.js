const mongoose = require('mongoose');
const Expense = require('../expenses/expense.model');
const { ROLES, EXPENSE_STATUS } = require('../../constants');

function scopeMatch(user) {
  const match = { isDeleted: false };
  if (user.role !== ROLES.ADMIN) {
    match.createdBy = new mongoose.Types.ObjectId(user.id);
  }
  return match;
}

async function summary(user, { year, month } = {}) {
  const now = new Date();
  const targetYear = year || now.getUTCFullYear();
  const targetMonth = month || now.getUTCMonth() + 1; // 1-12

  const monthStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
  const monthEnd = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));
  const yearStart = new Date(Date.UTC(targetYear, 0, 1));
  const yearEnd = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999));

  const base = scopeMatch(user);

  const [totals, monthly, yearly, highest, categorySummary, monthlyTrends, statusBreakdown, pending] =
    await Promise.all([
      Expense.aggregate([
        { $match: base },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { ...base, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { ...base, date: { $gte: yearStart, $lte: yearEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.findOne(base).sort({ amount: -1 }).lean(),
      Expense.aggregate([
        { $match: base },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            ...base,
            date: { $gte: yearStart, $lte: yearEnd },
          },
        },
        {
          $group: {
            _id: { $month: '$date' },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: base },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      Expense.countDocuments({ ...base, status: EXPENSE_STATUS.PENDING }),
    ]);

  const statusMap = { pending: 0, approved: 0, rejected: 0 };
  statusBreakdown.forEach((row) => {
    if (row._id in statusMap) statusMap[row._id] = row.count;
  });

  const trendMap = new Map(monthlyTrends.map((r) => [r._id, r]));
  const fullTrends = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const row = trendMap.get(m);
    return {
      month: m,
      total: row ? row.total : 0,
      count: row ? row.count : 0,
    };
  });

  return {
    totalExpenses: totals[0]?.count || 0,
    totalAmount: totals[0]?.total || 0,
    monthlyTotal: monthly[0]?.total || 0,
    monthlyCount: monthly[0]?.count || 0,
    yearlyTotal: yearly[0]?.total || 0,
    yearlyCount: yearly[0]?.count || 0,
    highestExpense: highest || null,
    categorySummary: categorySummary.map((c) => ({
      category: c._id,
      total: c.total,
      count: c.count,
    })),
    monthlyTrends: fullTrends,
    statusBreakdown: statusMap,
    pendingExpenses: pending,
    period: { year: targetYear, month: targetMonth },
  };
}

module.exports = { summary };