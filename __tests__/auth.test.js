import request from 'supertest';
import { createApp } from '../app.js';

describe('Authentication Endpoints', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      // TODO: Implement when auth routes are created
      // const response = await request(app)
      //   .post('/auth/register')
      //   .send({
      //     username: 'testuser',
      //     password: 'password123',
      //   });
      //
      // expect(response.status).toBe(201);
      // expect(response.body).toHaveProperty('id');
      // expect(response.body).toHaveProperty('token');
      // expect(response.body.username).toBe('testuser');
    });

    it('should reject duplicate usernames', async () => {
      // TODO: Implement when auth routes are created
    });

    it('should validate required fields', async () => {
      // TODO: Implement when auth routes are created
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      // TODO: Implement when auth routes are created
      // const response = await request(app)
      //   .post('/auth/login')
      //   .send({
      //     username: 'testuser',
      //     password: 'password123',
      //   });
      //
      // expect(response.status).toBe(200);
      // expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid password', async () => {
      // TODO: Implement when auth routes are created
    });

    it('should reject non-existent user', async () => {
      // TODO: Implement when auth routes are created
    });
  });
});
