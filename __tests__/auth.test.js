import { jest } from '@jest/globals'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { createApp } from '../app.js'

jest.mock('../lib/prisma.js')

import { prisma } from '../lib/prisma.js'

describe('Authentication Endpoints', () => {
  const app = request(createApp())
  let hashedPassword

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('password123', 10)
  })

  beforeEach(() => {
    prisma.user.findUnique = jest.fn()
    prisma.user.create = jest.fn()
  })

  describe('POST /auth/signup', () => {
    it('should register a new user with valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({ id: 1, username: 'testuser', password: hashedPassword })

      const res = await app.post('/auth/signup')
        .send({ username: 'testuser', password: 'password123' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body.username).toBe('testuser')
    })

    it('should reject duplicate usernames', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, username: 'testuser' })

      const res = await app.post('/auth/signup')
        .send({ username: 'testuser', password: 'password123' })

      expect(res.status).toBe(409)
      expect(res.body).toHaveProperty('error', 'Username taken')
    })

    it('should validate required fields', async () => {
      const res = await app.post('/auth/signup')
        .send({ username: '', password: '' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'Missing fields')
    })
  })

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, username: 'testuser', password: hashedPassword })

      const res = await app.post('/auth/login')
        .send({ username: 'testuser', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
    })

    it('should reject invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, username: 'testuser', password: hashedPassword })

      const res = await app.post('/auth/login')
        .send({ username: 'testuser', password: 'wrongpass' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Invalid credentials')
    })

    it('should reject non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const res = await app.post('/auth/login')
        .send({ username: 'ghost', password: 'password123' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Invalid credentials')
    })
  })
})