const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const expenseService = require('./expense.service');

const list = asyncHandler(async (req, res) => {
  const data = await expenseService.list(req.user, req.validatedQuery);
  return success(res, 200, 'Expenses fetched successfully', data);
});

const getOne = asyncHandler(async (req, res) => {
  const data = await expenseService.getById(req.user, req.validatedParams.id);
  return success(res, 200, 'Expense fetched successfully', data);
});

const create = asyncHandler(async (req, res) => {
  const expense = await expenseService.create(req.user, req.body);
  return success(res, 201, 'Expense created successfully', { expense });
});

const update = asyncHandler(async (req, res) => {
  const expense = await expenseService.update(req.user, req.validatedParams.id, req.body);
  return success(res, 200, 'Expense updated successfully', { expense });
});

const remove = asyncHandler(async (req, res) => {
  await expenseService.softDelete(req.user, req.validatedParams.id);
  return success(res, 200, 'Expense deleted successfully', {});
});

const approve = asyncHandler(async (req, res) => {
  const expense = await expenseService.approve(req.user, req.validatedParams.id, req.body);
  return success(res, 200, 'Expense approved successfully', { expense });
});

const reject = asyncHandler(async (req, res) => {
  const expense = await expenseService.reject(req.user, req.validatedParams.id, req.body);
  return success(res, 200, 'Expense rejected successfully', { expense });
});

module.exports = { list, getOne, create, update, remove, approve, reject };