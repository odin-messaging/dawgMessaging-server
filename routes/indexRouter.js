import express from 'express'
import * as indexController from "../controllers/indexController.js"
import passport from 'passport'
const indexRouter = express.Router()

// ------ GET -------- //
indexRouter.get("/", indexController.test)
indexRouter.get("/users", passport.authenticate('jwt', { session: false }), indexController.getAllOtherUsers)
indexRouter.get("/users/friends", passport.authenticate('jwt', { session: false }), indexController.getFriends)
indexRouter.get("/users/friends/not-in-chat/:chatId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfInChatMiddleware,
  indexController.sendAllFriendsNotInGroupChat)
indexRouter.get("/users/friends/chats", passport.authenticate('jwt', { session: false }), indexController.getUserChats)
indexRouter.get("/users/not-friends", passport.authenticate('jwt', { session: false }), indexController.getAllOtherUsersThatAreNotFriends)
indexRouter.get(
  "/users/friends/message/:chatId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfInChatMiddleware,
  indexController.getConversation
)
indexRouter.get("/users/profile/:id", indexController.sendProfile)
indexRouter.get("/users/friends/requests", passport.authenticate('jwt', { session: false }), indexController.getAllFriendRequests)

// ------ POST -------- //
indexRouter.post("/users/friends/requests/:friendId", passport.authenticate('jwt', { session: false }), indexController.acceptFriendRequest)
indexRouter.post("/users/friends/request/:friendId", passport.authenticate('jwt', { session: false }), indexController.sendFriendRequest)
indexRouter.post(
  "/users/friends/message/:chatId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfInChatMiddleware,
  indexController.sendMessage
)
indexRouter.post("/users/friends/chats",
  passport.authenticate('jwt', { session: false }),
  indexController.createGroupChat
)
indexRouter.post("/users/friends/chats/:chatId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfInChatMiddleware,
  indexController.addFriendToGroupChat
)

// ------ PATCH -------- //
indexRouter.patch("/ping", passport.authenticate('jwt', { session: false }), indexController.ping)
indexRouter.patch(
  "/users/friends/chats/:chatId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfInChatMiddleware,
  indexController.leaveGroupChat
)

// ------ DELETE -------- //
indexRouter.delete("/users/friends/requests/:friendId", passport.authenticate('jwt', { session: false }), indexController.deleteFriendRequest)
indexRouter.delete(
  "/users/friends/:friendId",
  passport.authenticate('jwt', { session: false }),
  indexController.checkIfFriendsMiddleware,
  indexController.removeFriend
)

export default indexRouter