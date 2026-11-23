const mongoose = require('mongoose');
const Expense = require('./expense.model');
const AuditLogService = require('./auditLog.service');
const ApiError = require('../../utils/ApiError');
const { EXPENSE_STATUS, ROLES, AUDIT_ACTIONS } = require('../../constants');

function buildListFilter(user, query) {
  const filter = { isDeleted: false };

  if (user.role !== ROLES.ADMIN) {
    filter.createdBy = new mongoose.Types.ObjectId(user.id);
  }

  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  }
  return filter;
}

async function list(user, query) {
  const filter = buildListFilter(user, query);
  const sort = { [query.sortBy]: query.order === 'asc' ? 1 : -1 };
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .lean(),
    Expense.countDocuments(filter),
  ]);

  return {
    expenses: items,
    pagination: {
      currentPage: query.page,
      totalPages: Math.ceil(total / query.limit),
      totalRecords: total,
      limit: query.limit,
    },
  };
}

async function getById(user, id) {
  const expense = await Expense.findOne({ _id: id, isDeleted: false })
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email')
    .lean();

  if (!expense) throw ApiError.notFound('Expense not found');
  if (user.role !== ROLES.ADMIN && expense.createdBy._id.toString() !== user.id) {
    throw ApiError.forbidden('You do not have access to this expense');
  }

  const history = await AuditLogService.listForExpense(id);
  return { expense, history };
}

async function create(user, payload) {
  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const [doc] = await Expense.create(
        [{ ...payload, createdBy: user.id, status: EXPENSE_STATUS.PENDING }],
        { session },
      );
      await AuditLogService.record(
        {
          expenseId: doc._id,
          action: AUDIT_ACTIONS.CREATED,
          performedBy: user.id,
          previousData: null,
          newData: doc.toObject(),
        },
        session,
      );
      created = doc;
    });
    return created;
  } finally {
    await session.endSession();
  }
}

async function update(user, id, payload) {
  const session = await mongoose.startSession();
  try {
    let updated;
    await session.withTransaction(async () => {
      const existing = await Expense.findOne({ _id: id, isDeleted: false }).session(session);
      if (!existing) throw ApiError.notFound('Expense not found');
           if (user.role !== ROLES.ADMIN) {
        if (existing.createdBy.toString() !== user.id) {
          throw ApiError.forbidden('You can only update your own expenses');
        }
        if (existing.status === EXPENSE_STATUS.APPROVED) {
          throw ApiError.forbidden('Approved expenses cannot be edited');
        }
      }

      if (payload.version !== undefined && payload.version !== existing.version) {
        throw ApiError.conflict('Expense was modified by another request. Please refresh.');
      }

      const previousData = existing.toObject();
      const editable = ['title', 'amount', 'category', 'date', 'paymentMethod', 'description'];
      editable.forEach((field) => {
        if (payload[field] !== undefined) existing[field] = payload[field];
      });
      existing.version += 1;

      await existing.save({ session });

      await AuditLogService.record(
        {
          expenseId: existing._id,
          action: AUDIT_ACTIONS.UPDATED,
          performedBy: user.id,
          previousData,
          newData: existing.toObject(),
        },
        session,
      );
      updated = existing;
    });
    return updated;
  } finally {
    await session.endSession();
  }
}

async function softDelete(user, id) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existing = await Expense.findOne({ _id: id, isDeleted: false }).session(session);
      if (!existing) throw ApiError.notFound('Expense not found');
           if (user.role !== ROLES.ADMIN) {
        if (existing.createdBy.toString() !== user.id) {
          throw ApiError.forbidden('You can only delete your own expenses');
        }
        if (existing.status === EXPENSE_STATUS.APPROVED) {
          throw ApiError.forbidden('Approved expenses cannot be deleted');
        }
      }

      const previousData = existing.toObject();
      existing.isDeleted = true;
      existing.deletedAt = new Date();
      existing.version += 1;
      await existing.save({ session });

      await AuditLogService.record(
        {
          expenseId: existing._id,
          action: AUDIT_ACTIONS.DELETED,
          performedBy: user.id,
          previousData,
          newData: null,
        },
        session,
      );
    });
  } finally {
    await session.endSession();
  }
}

async function approve(admin, id, payload = {}) {
  const session = await mongoose.startSession();
  try {
    let updated;
    await session.withTransaction(async () => {
      const filter = { _id: id, isDeleted: false, status: EXPENSE_STATUS.PENDING };
      if (payload.version !== undefined) filter.version = payload.version;

      const existing = await Expense.findOne(filter).session(session);
      if (!existing) {
        const maybe = await Expense.findOne({ _id: id, isDeleted: false }).session(session);
        if (!maybe) throw ApiError.notFound('Expense not found');
        if (maybe.isDeleted) throw ApiError.conflict('Expense is deleted');
        throw ApiError.conflict('Expense is not pending or was already processed');
      }

      const previousData = existing.toObject();
      existing.status = EXPENSE_STATUS.APPROVED;
      existing.approvedBy = admin.id;
      existing.approvedAt = new Date();
      existing.version += 1;
      await existing.save({ session });

      await AuditLogService.record(
        {
          expenseId: existing._id,
          action: AUDIT_ACTIONS.APPROVED,
          performedBy: admin.id,
          previousData,
          newData: existing.toObject(),
        },
        session,
      );
      updated = existing;
    });
    return updated;
  } finally {
    await session.endSession();
  }
}

async function reject(admin, id, { rejectionReason }) {
  const session = await mongoose.startSession();
  try {
    let updated;
    await session.withTransaction(async () => {
      const filter = { _id: id, isDeleted: false, status: EXPENSE_STATUS.PENDING };
      const existing = await Expense.findOne(filter).session(session);
      if (!existing) {
        const maybe = await Expense.findOne({ _id: id, isDeleted: false }).session(session);
        if (!maybe) throw ApiError.notFound('Expense not found');
        throw ApiError.conflict('Expense is not pending or was already processed');
      }

      const previousData = existing.toObject();
      existing.status = EXPENSE_STATUS.REJECTED;
      existing.rejectedBy = admin.id;
      existing.rejectedAt = new Date();
      existing.rejectionReason = rejectionReason;
      existing.version += 1;
      await existing.save({ session });

      await AuditLogService.record(
        {
          expenseId: existing._id,
          action: AUDIT_ACTIONS.REJECTED,
          performedBy: admin.id,
          previousData,
          newData: existing.toObject(),
          metadata: { rejectionReason },
        },
        session,
      );
      updated = existing;
    });
    return updated;
  } finally {
    await session.endSession();
  }
}

function buildExportFilter(user, query) {
  return buildListFilter(user, query);
}

module.exports = {
  list,
  getById,
  create,
  update,
  softDelete,
  approve,
  reject,
  buildExportFilter,
};