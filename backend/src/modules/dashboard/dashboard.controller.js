const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const dashboardService = require('./dashboard.service');

const getSummary = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const data = await dashboardService.summary(req.user, {
    year: year ? Number(year) : undefined,
    month: month ? Number(month) : undefined,
  });
  return success(res, 200, 'Dashboard summary fetched successfully', data);
});

module.exports = { getSummary };