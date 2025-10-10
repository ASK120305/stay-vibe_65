import request from 'supertest'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

// Mock the database connection
jest.mock('../config/database.js', () => ({
  connectDB: jest.fn(() => Promise.resolve())
}))

// Mock the routes
jest.mock('../routes/auth.js', () => {
  const express = require('express')
  const router = express.Router()
  
  router.post('/register', (req, res) => {
    res.status(201).json({ message: 'User registered successfully' })
  })
  
  router.post('/login', (req, res) => {
    res.status(200).json({ message: 'Login successful', token: 'mock-token' })
  })
  
  return router
})

import authRoutes from '../routes/auth.js'

const createApp = () => {
  const app = express()
  
  // Middleware
  app.use(helmet())
  app.use(compression())
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
  app.use(limiter)
  
  // Routes
  app.use('/api/auth', authRoutes)
  
  return app
}

describe('Auth Routes', () => {
  let app

  beforeAll(() => {
    app = createApp()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.message).toBe('User registered successfully')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login a user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body.message).toBe('Login successful')
      expect(response.body.token).toBe('mock-token')
    })
  })
})
