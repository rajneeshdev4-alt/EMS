const request = require('supertest');
const { app, createUser } = require('./helpers');
const { ROLES } = require('../src/constants');

async function loginAgent(email, password) {
  const agent = request.agent(app);
  const res = await agent.post('/api/v1/auth/login').send({ email, password });
  const cookies = res.headers['set-cookie'] || [];
  const csrfCookie = cookies.find((c) => c.startsWith('csrf_token='));
  const csrfToken = csrfCookie ? csrfCookie.split(';')[0].split('=')[1] : '';
  return { agent, csrfToken };
}

function payload(overrides = {}) {
  return {
    title: 'Item',
    amount: 100,
    category: 'Hardware',
    date: new Date().toISOString(),
    paymentMethod: 'Credit Card',
    description: 'd',
    ...overrides,
  };
}

describe('Dashboard', () => {
  test('user isolation and admin totals', async () => {
    await createUser({ email: 'admin@test.com', password: 'Admin@123', role: ROLES.ADMIN });
    await createUser({ email: 'u1@test.com', password: 'Passw0rd!' });
    await createUser({ email: 'u2@test.com', password: 'Passw0rd!' });

    const u1 = await loginAgent('u1@test.com', 'Passw0rd!');
    await u1.agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', u1.csrfToken)
      .send(payload({ amount: 100 }));
    const u2 = await loginAgent('u2@test.com', 'Passw0rd!');
    await u2.agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', u2.csrfToken)
      .send(payload({ amount: 200 }));

    const u1sum = await u1.agent.get('/api/v1/dashboard/summary');
    expect(u1sum.status).toBe(200);
    expect(u1sum.body.data.totalExpenses).toBe(1);
    expect(u1sum.body.data.totalAmount).toBe(100);

    const admin = await loginAgent('admin@test.com', 'Admin@123');
    const asum = await admin.agent.get('/api/v1/dashboard/summary');
    expect(asum.body.data.totalExpenses).toBe(2);
    expect(asum.body.data.totalAmount).toBe(300);
  });
});