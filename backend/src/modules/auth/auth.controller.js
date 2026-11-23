const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const authService = require('./auth.service');
const {
  setAuthCookie,
  clearAuthCookie,
  setCsrfCookie,
  clearCsrfCookie,
} = require('../../utils/cookie');

const login = asyncHandler(async (req, res) => {
  const { token, user, csrfToken } = await authService.login(req.body);
  setAuthCookie(res, token);
  setCsrfCookie(res, csrfToken);
  return success(res, 200, 'Login successful', { user, csrfToken });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  return success(res, 200, 'Logout successful', {});
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return success(res, 200, 'Profile fetched successfully', { user });
});

const register = asyncHandler(async (req, res) => {
  const { token, user, csrfToken } = await authService.register(req.body);
  setAuthCookie(res, token);
  setCsrfCookie(res, csrfToken); // <--- Change this line (it was setCsrfToken before)
  return success(res, 201, 'Registration successful', { user, csrfToken });
});
// Add to exports

module.exports = { login, logout, me, register };