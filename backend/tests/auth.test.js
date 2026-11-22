const request = require('supertest');
const { app, createUser } = require('./helpers');
const { ROLES } = require('../src/constants');

describe('Auth', () => {
  test('login success returns user and sets cookies', async () => {
    await createUser({ email: 'admin@test.com', password: 'Admin@123', role: ROLES.ADMIN });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@test.com');
    expect(res.body.data.user.password).toBeUndefined();
    const cookieHeader = res.headers['set-cookie'].join(';');
    expect(cookieHeader).toMatch(/access_token=/);
    expect(cookieHeader).toMatch(/csrf_token=/);
  });

  test('login invalid password', async () => {
    await createUser({ email: 'u@test.com', password: 'Passw0rd!' });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'u@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('login missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
  });

  test('inactive user cannot log in', async () => {
    await createUser({ email: 'inactive@test.com', password: 'Passw0rd!', isActive: false });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'inactive@test.com', password: 'Passw0rd!' });
    expect(res.status).toBe(403);
  });

  test('unauthenticated access denied', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  test('me returns profile when authenticated', async () => {
    const agent = request.agent(app);
    await createUser({ email: 'me@test.com', password: 'Passw0rd!' });
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'me@test.com', password: 'Passw0rd!' });
    expect(login.status).toBe(200);

    const me = await agent.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe('me@test.com');
  });
});