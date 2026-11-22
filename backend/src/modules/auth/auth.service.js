const crypto = require('crypto');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { signToken } = require('../../utils/token');

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function login({ email, password }) {
  const user = await User.findByEmail(email).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  const token = signToken({ sub: user._id.toString(), role: user.role });
  const safeUser = user.toJSON();

  return { token, user: safeUser, csrfToken: generateCsrfToken() };
}

async function getProfile(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw ApiError.notFound('User not found');
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

module.exports = { login, getProfile };