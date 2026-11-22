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
    title: 'Laptop',
    amount: 100,
    category: 'Hardware',
    date: new Date().toISOString(),
    paymentMethod: 'Credit Card',
    description: 'desc',
    ...overrides,
  };
}

describe('Expenses', () => {
  test('create expense and list', async () => {
    await createUser({ email: 'user1@test.com', password: 'Passw0rd!' });
    const { agent, csrfToken } = await loginAgent('user1@test.com', 'Passw0rd!');

    const create = await agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', csrfToken)
      .send(payload());
    expect(create.status).toBe(201);
    expect(create.body.data.expense.status).toBe('pending');

    const list = await agent.get('/api/v1/expenses?page=1&limit=10');
    expect(list.status).toBe(200);
    expect(list.body.data.expenses).toHaveLength(1);
    expect(list.body.data.pagination.totalRecords).toBe(1);
  });

  test('validation error on create', async () => {
    await createUser({ email: 'user2@test.com', password: 'Passw0rd!' });
    const { agent, csrfToken } = await loginAgent('user2@test.com', 'Passw0rd!');
    const res = await agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', csrfToken)
      .send({ title: '' });
    expect(res.status).toBe(400);
  });

  test('user cannot access another user expense', async () => {
    const u1 = await createUser({ email: 'a@test.com', password: 'Passw0rd!' });
    await createUser({ email: 'b@test.com', password: 'Passw0rd!' });

    const a = await loginAgent('a@test.com', 'Passw0rd!');
    const create = await a.agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', a.csrfToken)
      .send(payload());
    const id = create.body.data.expense._id;

    const b = await loginAgent('b@test.com', 'Passw0rd!');
    const res = await b.agent.get(`/api/v1/expenses/${id}`);
    expect(res.status).toBe(403);
  });

  test('update own expense increments version', async () => {
    await createUser({ email: 'upd@test.com', password: 'Passw0rd!' });
    const { agent, csrfToken } = await loginAgent('upd@test.com', 'Passw0rd!');
    const create = await agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', csrfToken)
      .send(payload());
    const id = create.body.data.expense._id;

    const upd = await agent
      .patch(`/api/v1/expenses/${id}`)
      .set('x-csrf-token', csrfToken)
      .send({ title: 'Updated', version: 0 });
    expect(upd.status).toBe(200);
    expect(upd.body.data.expense.version).toBe(1);
  });

  test('soft delete hides from list', async () => {
    await createUser({ email: 'del@test.com', password: 'Passw0rd!' });
    const { agent, csrfToken } = await loginAgent('del@test.com', 'Passw0rd!');
    const create = await agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', csrfToken)
      .send(payload());
    const id = create.body.data.expense._id;

    const del = await agent.delete(`/api/v1/expenses/${id}`).set('x-csrf-token', csrfToken);
    expect(del.status).toBe(200);

    const list = await agent.get('/api/v1/expenses');
    expect(list.body.data.expenses).toHaveLength(0);
  });

  test('user cannot approve; admin can', async () => {
    const admin = await createUser({
      email: 'admin2@test.com',
      password: 'Admin@123',
      role: ROLES.ADMIN,
    });
    await createUser({ email: 'user3@test.com', password: 'Passw0rd!' });

    const user = await loginAgent('user3@test.com', 'Passw0rd!');
    const create = await user.agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', user.csrfToken)
      .send(payload());
    const id = create.body.data.expense._id;

    const forbidden = await user.agent
      .post(`/api/v1/expenses/${id}/approve`)
      .set('x-csrf-token', user.csrfToken)
      .send({});
    expect(forbidden.status).toBe(403);

    const adminAuth = await loginAgent('admin2@test.com', 'Admin@123');
    const approved = await adminAuth.agent
      .post(`/api/v1/expenses/${id}/approve`)
      .set('x-csrf-token', adminAuth.csrfToken)
      .send({});
    expect(approved.status).toBe(200);
    expect(approved.body.data.expense.status).toBe('approved');
    expect(approved.body.data.expense.approvedBy).toBeTruthy();

    // Approving again should conflict
    const again = await adminAuth.agent
      .post(`/api/v1/expenses/${id}/approve`)
      .set('x-csrf-token', adminAuth.csrfToken)
      .send({});
    expect(again.status).toBe(409);
  });

  test('admin can reject with reason', async () => {
    await createUser({ email: 'admin3@test.com', password: 'Admin@123', role: ROLES.ADMIN });
    await createUser({ email: 'user4@test.com', password: 'Passw0rd!' });

    const user = await loginAgent('user4@test.com', 'Passw0rd!');
    const create = await user.agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', user.csrfToken)
      .send(payload());
    const id = create.body.data.expense._id;

    const adminAuth = await loginAgent('admin3@test.com', 'Admin@123');
    const rej = await adminAuth.agent
      .post(`/api/v1/expenses/${id}/reject`)
      .set('x-csrf-token', adminAuth.csrfToken)
      .send({ rejectionReason: 'Not allowed' });
    expect(rej.status).toBe(200);
    expect(rej.body.data.expense.status).toBe('rejected');
    expect(rej.body.data.expense.rejectionReason).toBe('Not allowed');
  });
});