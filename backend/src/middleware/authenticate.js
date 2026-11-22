const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/token');
const { COOKIE_NAME } = require('../utils/cookie');
const User = require('../modules/users/user.model');

async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired session');
    }

    const user = await User.findById(payload.sub).lean();
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticateUser };