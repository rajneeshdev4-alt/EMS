const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const { ROLES } = require('../src/constants');

async function createUser(overrides = {}) {
  const defaults = {
    name: 'Test User',
    email: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: 'Passw0rd!',
    role: ROLES.USER,
  };
  return User.create({ ...defaults, ...overrides });
}

async function loginAs(email, password) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  const cookies = res.headers['set-cookie'] || [];
  const csrfCookie = cookies.find((c) => c.startsWith('csrf_token='));
  const csrfToken = csrfCookie ? csrfCookie.split(';')[0].split('=')[1] : '';
  return { res, cookies, csrfToken };
}

function withAuth(agent, csrfToken) {
  const csrf = csrfToken || '';
  return {
    get: (url) => agent.get(url),
    post: (url, body) => agent.post(url).set('x-csrf-token', csrf).send(body),
    patch: (url, body) => agent.patch(url).set('x-csrf-token', csrf).send(body),
    delete: (url) => agent.delete(url).set('x-csrf-token', csrf),
  };
}

module.exports = { app, createUser, loginAs, withAuth };