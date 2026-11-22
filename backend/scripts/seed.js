/* eslint-disable no-console */
const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/modules/users/user.model');
const Expense = require('../src/modules/expenses/expense.model');
const AuditLog = require('../src/modules/expenses/auditLog.model');
const {
  ROLES,
  EXPENSE_STATUS,
  CATEGORIES,
  PAYMENT_METHODS,
  AUDIT_ACTIONS,
} = require('../src/constants');

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function seed() {
  await mongoose.connect(env.mongodbUri);
  console.log('[SEED] Connected');

  const adminEmail = 'admin@example.com';
  const userEmail = 'user@example.com';

  let admin = await User.findByEmail(adminEmail);
  if (!admin) {
    admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'Admin@123',
      role: ROLES.ADMIN,
    });
    console.log('[SEED] Created admin');
  } else {
    console.log('[SEED] Admin exists');
  }

  let user = await User.findByEmail(userEmail);
  if (!user) {
    user = await User.create({
      name: 'Regular User',
      email: userEmail,
      password: 'User@123',
      role: ROLES.USER,
    });
    console.log('[SEED] Created user');
  } else {
    console.log('[SEED] User exists');
  }

  const existingCount = await Expense.countDocuments({ createdBy: user._id });
  if (existingCount > 0) {
    console.log('[SEED] Expenses already exist for demo user, skipping');
    await mongoose.disconnect();
    return;
  }

  const samples = [
    {
      title: 'Laptop for development',
      amount: 1899.99,
      category: 'Hardware',
      paymentMethod: 'Credit Card',
      date: daysAgo(120),
      description: 'MacBook Pro 14" for engineering team',
      status: EXPENSE_STATUS.APPROVED,
    },
    {
      title: 'Team dinner',
      amount: 245.5,
      category: 'Meals',
      paymentMethod: 'Credit Card',
      date: daysAgo(45),
      description: 'Quarterly team dinner',
      status: EXPENSE_STATUS.APPROVED,
    },
    {
      title: 'Conference flight',
      amount: 620,
      category: 'Travel',
      paymentMethod: 'Credit Card',
      date: daysAgo(30),
      description: 'Flight to AWS re:Invent',
      status: EXPENSE_STATUS.PENDING,
    },
    {
      title: 'Office chairs',
      amount: 540,
      category: 'Office Supplies',
      paymentMethod: 'Bank Transfer',
      date: daysAgo(20),
      description: 'Ergonomic office chairs x2',
      status: EXPENSE_STATUS.PENDING,
    },
    {
      title: 'Software subscription',
      amount: 99,
      category: 'Software',
      paymentMethod: 'Credit Card',
      date: daysAgo(15),
      description: 'Annual IDE license',
      status: EXPENSE_STATUS.REJECTED,
      rejectionReason: 'Please use existing team license',
    },
    {
      title: 'Online course',
      amount: 49.99,
      category: 'Training',
      paymentMethod: 'UPI',
      date: daysAgo(10),
      description: 'System design course',
      status: EXPENSE_STATUS.PENDING,
    },
    {
      title: 'Marketing ads',
      amount: 300,
      category: 'Marketing',
      paymentMethod: 'Credit Card',
      date: daysAgo(5),
      description: 'Google Ads campaign',
      status: EXPENSE_STATUS.APPROVED,
    },
    {
      title: 'Internet bill',
      amount: 75,
      category: 'Utilities',
      paymentMethod: 'Bank Transfer',
      date: daysAgo(3),
      description: 'Monthly office internet',
      status: EXPENSE_STATUS.PENDING,
    },
  ];

  const created = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const s of samples) {
    const doc = await Expense.create({
      title: s.title,
      amount: s.amount,
      category: s.category,
      paymentMethod: s.paymentMethod,
      date: s.date,
      description: s.description,
      status: s.status,
      createdBy: user._id,
      approvedBy: s.status === EXPENSE_STATUS.APPROVED ? admin._id : null,
      approvedAt: s.status === EXPENSE_STATUS.APPROVED ? s.date : null,
      rejectedBy: s.status === EXPENSE_STATUS.REJECTED ? admin._id : null,
      rejectedAt: s.status === EXPENSE_STATUS.REJECTED ? s.date : null,
      rejectionReason: s.rejectionReason || null,
    });
    created.push(doc);

    await AuditLog.create({
      expenseId: doc._id,
      action: AUDIT_ACTIONS.CREATED,
      performedBy: user._id,
      previousData: null,
      newData: doc.toObject(),
    });
    if (s.status === EXPENSE_STATUS.APPROVED) {
      await AuditLog.create({
        expenseId: doc._id,
        action: AUDIT_ACTIONS.APPROVED,
        performedBy: admin._id,
        previousData: null,
        newData: doc.toObject(),
      });
    }
    if (s.status === EXPENSE_STATUS.REJECTED) {
      await AuditLog.create({
        expenseId: doc._id,
        action: AUDIT_ACTIONS.REJECTED,
        performedBy: admin._id,
        previousData: null,
        newData: doc.toObject(),
        metadata: { rejectionReason: s.rejectionReason },
      });
    }
  }

  console.log(`[SEED] Created ${created.length} expenses and audit records`);
  await mongoose.disconnect();
  console.log('[SEED] Done');
}

seed().catch(async (err) => {
  console.error('[SEED] Failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});