const env = require('../config/env');

const COOKIE_NAME = 'access_token';
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

const baseCookieOptions = {
  httpOnly: true,
  secure: true,           // MUST be true for cross-site
  sameSite: 'none',       // MUST be 'none' for cross-site
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

const csrfCookieOptions = {
  httpOnly: false, // must be readable by JS to send in header
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, baseCookieOptions);
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...baseCookieOptions, maxAge: undefined });
}

function setCsrfCookie(res, csrfToken) {
  res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions);
}

function clearCsrfCookie(res) {
  res.clearCookie(CSRF_COOKIE_NAME, { ...csrfCookieOptions, maxAge: undefined });
}

module.exports = {
  COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  setAuthCookie,
  clearAuthCookie,
  setCsrfCookie,
  clearCsrfCookie,
};