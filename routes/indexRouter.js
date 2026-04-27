import express from 'express'
import * as indexController from "../controllers/indexController.js"
import passport from 'passport'

const indexRouter = express.Router()

indexRouter.get("/", indexController.test)
indexRouter.get("/users", passport.authenticate('jwt', { session: false }), indexController.getAllOtherUsers)
indexRouter.get("/users/friends", passport.authenticate('jwt', { session: false }), indexController.getFriends)
indexRouter.get("/users/not-friends", passport.authenticate('jwt', { session: false }), indexController.getAllOtherUsersThatAreNotFriends)
indexRouter.get(
  "/users/friends/message/:friendId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfFriendsMiddleware,
  indexController.getConversation
)
indexRouter.get("/users/profile/:id", indexController.sendProfile)


indexRouter.post("/users/friends/request/:friendId", passport.authenticate('jwt', { session: false }), indexController.sendFriendRequest)
indexRouter.post(
  "/users/friends/message/:friendId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfFriendsMiddleware,
  indexController.sendMessage
)

indexRouter.delete(
  "/users/friends/:friendId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfFriendsMiddleware,
  indexController.removeFriend
)

export default indexRouter