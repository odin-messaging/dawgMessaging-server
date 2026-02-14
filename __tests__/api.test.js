import request from 'supertest';
import { createApp } from '../app.js';

describe('API Endpoints', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /', () => {
    it('should return home page message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ msg: 'Home page' });
    });
  });

  describe('GET /me', () => {
    it('should return user object (undefined when not authenticated)', async () => {
      const response = await request(app).get('/me');

      expect(response.status).toBe(200);
      // req.user is undefined before passport is integrated
      expect(response.body).toBeUndefined();
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
