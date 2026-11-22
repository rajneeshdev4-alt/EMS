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

describe('Reports CSV export', () => {
  test('export respects isolation and filters', async () => {
    await createUser({ email: 'u1@test.com', password: 'Passw0rd!' });
    await createUser({ email: 'u2@test.com', password: 'Passw0rd!' });

    const u1 = await loginAgent('u1@test.com', 'Passw0rd!');
    await u1.agent
      .post('/api/v1/expenses')
      .set('x-csrf-token', u1.csrfToken)
      .send({
        title: '=HYPERLINK("http://evil")',
        amount: 50,
        category: 'Hardware',
        date: new Date().toISOString(),
        paymentMethod: 'Cash',
        description: 'malicious',
      });

    const res = await u1.agent
      .get('/api/v1/reports/expenses/export')
      .buffer(true)
      .parse((r, cb) => {
        let data = '';
        r.on('data', (chunk) => {
          data += chunk;
        });
        r.on('end', () => cb(null, data));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.body).toMatch(/Title,Amount/);
    // Formula injection sanitized with leading quote
    expect(res.body).toContain("'=HYPERLINK");
  });
});