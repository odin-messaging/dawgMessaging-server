import request from 'supertest';
import { createApp } from '../app.js';

const api = request(createApp())

it('check if wired', async () => {
  await api
    .get('/')
    .expect(200)
    .expect({ msg: 'test' });
})
