const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } = require('../utils/cookie');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// function verifyOrigin(req) {
//   const origin = req.headers.origin || req.headers.referer;
//   if (!origin) return false;
//   try {
//     const url = new URL(origin);
//     const allowed = new URL(env.frontendUrl);
//     return url.origin === allowed.origin;
//   } catch {
//     return false;
//   }
// }

function verifyOrigin(req) {
  const origin = req.headers.origin || req.headers.referer;
  console.log('[CSRF] req origin:', origin);
  console.log('[CSRF] env.frontendUrl:', env.frontendUrl);
  if (!origin) return false;
  try {
    const reqO = new URL(origin).origin;
    const allowedO = new URL(env.frontendUrl).origin;
    console.log('[CSRF] normalized:', reqO, 'vs', allowedO);
    return reqO === allowedO;
  } catch (e) {
    console.log('[CSRF] parse error:', e.message);
    return false;
  }
}

// Double-submit cookie CSRF protection + origin check for state-changing requests
function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  // Only enforce for cookie-authenticated requests
  const hasAuthCookie = Boolean(req.cookies?.access_token);
  if (!hasAuthCookie) return next();

  if (!verifyOrigin(req)) {
    return next(ApiError.forbidden('Invalid request origin'));
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken || !timingSafeEqual(cookieToken, headerToken)) {
    return next(ApiError.forbidden('CSRF token validation failed'));
  }

  return next();
}

module.exports = { csrfProtection };