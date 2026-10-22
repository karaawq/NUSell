const request = require('supertest');
const app = require('../app');

const sample = { title: 'Test Chair', description: 'A nice chair', price: 20, condition: 'good', category: 'Furniture', location: 'UTown' };

async function makeUser(over = {}) {
  const u = { username: 'seller01', email: 'seller@u.nus.edu', password: 'password123', telegram: 'seller01', ...over };
  const res = await request(app).post('/api/auth/register').send(u);
  return res.body.token;
}

describe('Listings API', () => {
  test('blocks creating a listing without a token', async () => {
    const res = await request(app).post('/api/listings').send(sample);
    expect(res.statusCode).toBe(401);
  });

  test('creates a listing when authenticated', async () => {
    const token = await makeUser();
    const res = await request(app).post('/api/listings').set('Authorization', `Bearer ${token}`).send(sample);
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Chair');
  });

  // test('returns active listings', async () => {
  //   const token = await makeUser();
  //   await request(app).post('/api/listings').set('Authorization', `Bearer ${token}`).send(sample);
  //   const res = await request(app).get('/api/listings').set('Authorization', `Bearer ${token}`);
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.length).toBe(1);
  // });

  test('returns active listings', async () => {
  const token = await makeUser();

  await request(app)
    .post('/api/listings')
    .set('Authorization', `Bearer ${token}`)
    .send(sample);

  const res = await request(app)
    .get('/api/listings')
    .set('Authorization', `Bearer ${token}`);

  console.log('TOKEN:', token);
  console.log('GET STATUS:', res.statusCode);
  console.log('GET BODY:', res.body);

  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBe(1);
});

  test('stops a non-owner from deleting a listing', async () => {
    const ownerToken = await makeUser();
    const created = await request(app).post('/api/listings').set('Authorization', `Bearer ${ownerToken}`).send(sample);
    const otherToken = await makeUser({ username: 'other001', email: 'other@u.nus.edu', telegram: 'other001' });
    const res = await request(app).delete(`/api/listings/${created.body._id}`).set('Authorization', `Bearer ${otherToken}`);
    expect(res.statusCode).toBe(403);
  });
});