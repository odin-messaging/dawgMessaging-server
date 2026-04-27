import { prisma } from '../lib/prisma.js'

const test = (req, res) => {
  res.status(200).json({ msg: 'test' })
}

const sendProfile = async (req, res) => {
  const { id } = req.params
  try {
    const selectedProfile = await prisma.user.findUnique({
      include: { avatar: true, password: false },
      where: {
        id: Number(id)
      }
    })

    res.json(selectedProfile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllOtherUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { avatar: true },
      orderBy: [{ username: 'asc' }],
      where: {
        NOT: {
          id: req.user.id
        }
      }
    })

    res.json(users)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllOtherUsersThatAreNotFriends = async (req, res) => {
  try {
    const friendships = await prisma.userFriend.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { friendId: req.user.id }
        ]
      }
    })

    const sentRequests = await prisma.userFriendRequest.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      }
    })

    console.log(sentRequests)

    const friendIds = friendships.map(f =>
      f.userId === req.user.id ? f.friendId : f.userId
    )

    const sentFriendIds = sentRequests.map(f =>
      f.senderId === req.user.id ? f.receiverId : f.senderId
    )

    const users = await prisma.user.findMany({
      include: { avatar: true },
      orderBy: { username: 'asc' },
      where: {
        id: {
          notIn: [req.user.id, ...friendIds, ...sentFriendIds]
        }
      }
    })

    res.json(users)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getFriends = async (req, res) => {
  try {
    const id = req.user.id

    // get all userFriend relations where the user is either the user or the friend, and include the related user and friend data
    const relations = await prisma.userFriend.findMany({
      where: {
        OR: [
          { userId: id },
          { friendId: id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            avatar: true,
          }
        }
      }
    })

    // then filter the relations to get the actual friend users (if the user is the user in the relation, then the friend is the friend, and vice versa)
    const friends = relations.map(r =>
      r.userId === id ? r.friend : r.user
    )

    res.json(friends)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const checkIfFriendsMiddleware = async (req, res, next) => {
  console.log('Checking if users are friends...')
  console.log('req.user:', req.user.id)
  console.log('req.params.friendId:', req.params.friendId)
  try {
    const friendId = Number(req.params.friendId)

    const isFriend = await prisma.userFriend.findFirst({
      where: {
        OR: [
          {
            userId: friendId,
            friendId: req.user.id
          },
          {
            userId: req.user.id,
            friendId,
          }
        ]
      },
    })

    if (!isFriend) {
      return res.status(403).json({ error: 'User is not a friend.' })
    }

    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getConversation = async (req, res) => {
  const { lastMessageId, direction } = req.query
  const { friendId } = req.params

  try {

    const conversation = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: req.user.id,
            receiverId: Number(friendId),
          },
          {
            senderId: Number(friendId),
            receiverId: req.user.id,
          }
        ]
      },
      take: 10,
      skip: lastMessageId ? 1 : 0,
      cursor: lastMessageId ? { id: Number(lastMessageId) } : undefined,
      orderBy: {
        id: direction === 'desc' ? 'desc' : 'asc'
      },
    })

    const json = direction === 'desc' ? conversation.reverse() : conversation
    res.json(json)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const sendMessage = async (req, res) => {
  const { message } = req.body
  const { friendId } = req.params

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' })
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: Number(friendId),
        message,
      }
    })

    res.json(newMessage)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const removeFriend = async (req, res) => {
  const { friendId } = req.params

  try {
    const deletedFriend = await prisma.userFriend.deleteMany({
      where: {
        OR: [
          {
            userId: Number(friendId),
            friendId: req.user.id
          },
          {
            userId: req.user.id,
            friendId: Number(friendId),
          }
        ]
      }
    })

    res.json(deletedFriend)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const sendFriendRequest = async (req, res) => {
  const { friendId } = req.params

  if (!friendId) {
    res.status(400).json({ error: 'No Friend ID passed!' })
    return
  }

  try {
    const alreadySent = await prisma.userFriendRequest.findFirst({
      where: {
        senderId: req.user.id,
        receiverId: Number(friendId),
      }
    })

    if (alreadySent) {
      res.status(409).json({ error: 'Already sent friend request!' })
      return
    }

    await prisma.userFriendRequest.create({
      data: {
        senderId: req.user.id,
        receiverId: Number(friendId),
      }
    })

    res.json({ message: 'success!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export {
  test,
  sendProfile,
  getAllOtherUsers,
  getFriends,
  getConversation,
  checkIfFriendsMiddleware,
  sendMessage,
  removeFriend,
  getAllOtherUsersThatAreNotFriends,
  sendFriendRequest,
}