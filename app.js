import 'dotenv/config'
import express from 'express'
import cors from "cors"
import passport from './lib/auth.js';

export function createApp() {
  const app = express();

  app.use(express.urlencoded({ extended: true }))
  app.use(cors())
  app.use(express.json())
  // app.use(passport.initialize())

  // app.use(authApp)

  // app.use("/", indexRouter);
  // app.use("/auth", authRouter);
  // app.use("/posts", passport.authenticate('jwt', { session: false }), postsRouter);
  app.get("/", (req, res) => {
    res.send({ msg: 'Home page' })
  })

  app.get(
    "/me",
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
      res.json(req.user)
    }
  )


  app.get('/{*splat}', (req, res, next) => {
    const err = new Error(`Page not found: ${req.originalUrl}`)
    err.statusCode = 404
    next(err)
  });

  return app;
}

const app = createApp();

app.listen(process.env.PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`My Express app - listening on port ${process.env.PORT}!`)
});

export default app