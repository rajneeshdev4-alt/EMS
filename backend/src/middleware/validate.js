const ApiError = require('../utils/ApiError');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }
    if (source === 'body') req.body = result.data;
    else if (source === 'query') req.validatedQuery = result.data;
    else req.validatedParams = result.data;
    return next();
  };
}

module.exports = { validate };