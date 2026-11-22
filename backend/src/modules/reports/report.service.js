const Expense = require('../expenses/expense.model');
const expenseService = require('../expenses/expense.service');
const { toCsv } = require('../../utils/csv');

const COLUMNS = [
  { label: 'Title', value: (e) => e.title },
  { label: 'Amount', value: (e) => e.amount },
  { label: 'Category', value: (e) => e.category },
  { label: 'Date', value: (e) => (e.date ? new Date(e.date).toISOString().slice(0, 10) : '') },
  { label: 'Payment Method', value: (e) => e.paymentMethod },
  { label: 'Description', value: (e) => e.description },
  { label: 'Status', value: (e) => e.status },
  { label: 'Created By', value: (e) => e.createdBy?.name || '' },
  { label: 'Approved By', value: (e) => e.approvedBy?.name || '' },
  { label: 'Approved At', value: (e) => (e.approvedAt ? new Date(e.approvedAt).toISOString() : '') },
  { label: 'Rejection Reason', value: (e) => e.rejectionReason || '' },
];

async function exportCsv(user, query, res) {
  const filter = expenseService.buildExportFilter(user, query);
  const cursor = Expense.find(filter)
    .sort({ date: -1 })
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .cursor();

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="expenses-${Date.now()}.csv"`,
  );

  const headerLine = COLUMNS.map((c) => c.label).join(',');
  res.write(`${headerLine}\n`);

  // eslint-disable-next-line no-restricted-syntax
  for await (const doc of cursor) {
    const row = toCsv([doc], COLUMNS);
    const line = row.split('\n')[1];
    res.write(`${line}\n`);
  }
  res.end();
}

module.exports = { exportCsv };