import express from 'express'
import * as authController from '../controllers/authController.js'
import passport from 'passport'

const authRouter = express.Router()

authRouter.post('/signup', authController.signup)
authRouter.post('/login', authController.login)
authRouter.get('/me', passport.authenticate('jwt' , { session: false }), authController.sendMyProfile)
authRouter.patch('/me', passport.authenticate('jwt' , { session: false }), authController.updateUser)

export default authRouter