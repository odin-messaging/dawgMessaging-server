import 'dotenv/config'
import express from 'express'
import cors from "cors"
import passport from './lib/auth.js';
import indexRouter from './routes/indexRouter.js';

export function createApp() {
  const app = express()

  app.use(express.urlencoded({ extended: true }))
  app.use(cors())
  app.use(express.json())
  app.use(passport.initialize())

  app.use("/", indexRouter)

  app.get('/{*splat}', (req, res, next) => {
    const err = new Error(`Page not found: ${req.originalUrl}`)
    err.statusCode = 404
    next(err)
  })

  return app
}

export default createApp