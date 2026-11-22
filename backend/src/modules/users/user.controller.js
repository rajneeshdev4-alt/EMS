const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const userService = require('./user.service');

const list = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  return success(res, 200, 'Users fetched successfully', { users });
});

module.exports = { list };