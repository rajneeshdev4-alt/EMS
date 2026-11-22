const asyncHandler = require('../../utils/asyncHandler');
const reportService = require('./report.service');

const exportExpenses = asyncHandler(async (req, res) => {
  await reportService.exportCsv(req.user, req.validatedQuery, res);
});

module.exports = { exportExpenses };