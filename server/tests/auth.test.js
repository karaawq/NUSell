const request = require('supertest');
const app = require('../app');

const user = { username: 'testuser', email: 'test@u.nus.edu', password: 'password123', telegram: 'testuser' };

describe('Auth API', () => {
  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  test('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.statusCode).toBe(400);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects a wrong password', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'wrongpass' });
    expect(res.statusCode).toBe(400);
  });
});