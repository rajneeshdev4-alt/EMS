const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate resource';
    errors = Object.keys(err.keyValue || {}).map((k) => ({
      field: k,
      message: `${k} already exists`,
    }));
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  if (env.isProduction && statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err);
  }

  const response = { success: false, message, errors };
  if (!env.isProduction && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = { errorHandler };