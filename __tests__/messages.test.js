import request from 'supertest';
import { createApp } from '../app.js';

describe('Message Endpoints', () => {
  let app;
  let authToken;
  let userId;

  beforeAll(() => {
    app = createApp();
    // TODO: Set up authenticated user with valid JWT token
  });

  describe('POST /messages', () => {
    it('should send a message to another user', async () => {
      // TODO: Implement when message routes are created
      // const response = await request(app)
      //   .post('/messages')
      //   .set('Authorization', `Bearer ${authToken}`)
      //   .send({
      //     receiverId: 2,
      //     content: 'Hello there!',
      //   });
      //
      // expect(response.status).toBe(201);
      // expect(response.body).toHaveProperty('id');
      // expect(response.body.senderId).toBe(userId);
      // expect(response.body.receiverId).toBe(2);
    });

    it('should require authentication', async () => {
      // TODO: Implement when message routes are created
    });

    it('should validate recipient exists', async () => {
      // TODO: Implement when message routes are created
    });
  });

  describe('GET /messages/:userId', () => {
    it('should retrieve messages for authenticated user', async () => {
      // TODO: Implement when message routes are created
      // const response = await request(app)
      //   .get(`/messages/${userId}`)
      //   .set('Authorization', `Bearer ${authToken}`);
      //
      // expect(response.status).toBe(200);
      // expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      // TODO: Implement when message routes are created
    });
  });

  describe('DELETE /messages/:messageId', () => {
    it('should delete a message by the sender', async () => {
      // TODO: Implement when message routes are created
    });

    it('should prevent deleting others messages', async () => {
      // TODO: Implement when message routes are created
    });
  });
});
