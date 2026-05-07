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

const getUserChats = async (req, res) => {
  try {
    const chats = await prisma.groupChat.findMany({
      include: {
        users: {
          select: {
            id: true,
            avatar: true,
            username: true,
            lastSeen: true
          }
        }
      },
      where: {
        users: {
          some: {
            id: req.user.id
          }
        }
      }
    })

    res.status(200).json(chats)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllOtherUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { avatar: true },
      orderBy: [
        { lastSeen: 'desc' },
        { username: 'asc' }
      ],
      where: {
        NOT: {
          id: req.user.id
        }
      }
    })

    res.status(200).json(users)

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

const getAllFriendRequests = async (req, res) => {
  try {
    const [me, others] = await Promise.all([
      prisma.userFriendRequest.findMany({
        where: {
          senderId: req.user.id
        },
        select: {
          receiver: {
            select: {
              avatar: true,
              username: true,
              id: true
            }
          }
        }
      }),
      prisma.userFriendRequest.findMany({
        where: {
          receiverId: req.user.id
        },
        select: {
          sender: {
            select: {
              avatar: true,
              username: true,
              id: true
            }
          }
        }
      }),
    ])

    const sentByMe = me.map((user) => {
      return user.receiver
    })

    const sentByOthers = others.map((user) => {
      return user.sender
    })

    res.json({ sentByMe, sentByOthers })
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
            lastSeen: true,
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            avatar: true,
            lastSeen: true,
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

const checkIfInChatMiddleware = async (req, res, next) => {
  try {
    const chatId = Number(req.params.chatId)
    const userId = Number(req.user.id)

    const isInChat = await prisma.groupChat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: userId
          }
        }
      }
    })

    if (!isInChat) {
      return res.status(403).json({ error: 'User is not in this chat.' })
    }

    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getConversation = async (req, res) => {
  const { lastMessageId, direction } = req.query
  const { chatId } = req.params

  const cursorId = lastMessageId ? Number(lastMessageId) : undefined

  if (cursorId && isNaN(cursorId)) {
    return res.status(400).json({ error: "Invalid cursor" })
  }

  try {

    const conversation = await prisma.message.findMany({
      where: {
        chatId: Number(chatId)
      },
      take: 10,
      select: {
        dateSent: true,
        message: true,
        id: true,
        sender: {
          select: {
            id: true,
            avatar: true,
            username: true,
          },
        },

      },
      skip: lastMessageId ? 1 : 0,
      cursor: lastMessageId ? { id: Number(lastMessageId) } : undefined,
      orderBy: {
        id: direction === 'desc' ? 'desc' : 'asc'
      },
    })

    if (!conversation) {
      return res.status(404).json({ error: 'Chat not found!' })
    }

    const json = direction === 'desc' ? conversation.reverse() : conversation
    res.json(json)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const sendMessage = async (req, res) => {
  const { message } = req.body
  const { chatId } = req.params

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' })
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        senderId: req.user.id,
        chatId: Number(chatId),
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

    if (!deletedFriend) {
      return res.json({ error: 'could not find friend to delete!' })
    }

    res.status(200).json({ message: "Friend Deleted" })
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

const deleteFriendRequest = async (req, res) => {
  const { friendId } = req.params
  try {
    const deletedFriendRequest = await prisma.userFriendRequest.deleteMany({
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
      }
    })

    if (deletedFriendRequest.count === 0) {
      return res.status(404).json({ error: "Friend request not found" })
    }

    res.json({ message: 'success!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const acceptFriendRequest = async (req, res) => {
  const { friendId } = req.params

  try {
    await prisma.$transaction(async (tx) => {
      const friendRequest = await tx.userFriendRequest.deleteMany({
        where: {
          receiverId: req.user.id,
          senderId: Number(friendId),
        }
      })

      if (friendRequest.count === 0) {
        throw new Error("NOT_FOUND")
      }

      await tx.userFriend.create({
        data: {
          userId: req.user.id,
          friendId: Number(friendId),
        }
      })

      await tx.groupChat.create({
        data: {
          title: 'Chat',
          users: {
            connect: [
              { id: req.user.id },
              { id: Number(friendId) }
            ]
          }
        }
      })
    })

    res.status(200).json({ message: "Friend request accepted" })

  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Friend request not found" })
    }

    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const ping = async (req, res) => {
  try {
    await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        lastSeen: new Date()
      }
    })

    res.status(200).json({ message: 'ping!'})
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const createGroupChat = async (req, res) => {
  const { userIdPayload } = req.body
  try {
    const chat = await prisma.groupChat.create({
      data: {
        title: 'Chat',
        users: {
          connect: [...userIdPayload, { id: req.user.id }]
        }
      }
    })

    if (!chat) {
      return res.json({ error: 'Error making group chat!' })
    }

    res.json(chat)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const addFriendToGroupChat = async (req, res) => {
  const { chatId } = req.params
  const { friendId } = req.body
  try {

    const chat = await prisma.groupChat.findUnique({
      where: { id: Number(chatId) },
      select: {
        users: {
          select: { id: true }
        }
      }
    })

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    const alreadyMember = chat.users.some(
      user => user.id === Number(friendId)
    )

    if (alreadyMember) {
      return res.status(400).json({ error: 'User already in chat' })
    }


    await prisma.groupChat.update({
      where: { id: Number(chatId) },
      data: {
        users: {
          connect: { id: Number(friendId) }
        }
      }
    })

    res.status(200).json({ message: 'Friend Added' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const sendAllFriendsNotInGroupChat = async (req, res) => {
  const { chatId } = req.params
  try {

    const currentMembers = await prisma.groupChat.findUnique({
      where: { id: Number(chatId) },
      select: { users: { select: { id: true } } }
    })

    const idsOfCurrentMembers = currentMembers.users
      .filter(user => user.id !== req.user.id)
      .map(user => user.id)

    const friends = await prisma.userFriend.findMany({
      where: {
        OR: [
          { friendId: req.user.id },
          { userId: req.user.id }
        ],
        NOT: {
          OR: [
            { userId: { in: idsOfCurrentMembers } },
            { friendId: { in: idsOfCurrentMembers } }
          ]
        }
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    const cleanedFriends = friends.map(f => {
      return f.user.id === req.user.id ? f.friend : f.user
    })

    res.json(cleanedFriends)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const leaveGroupChat = async (req, res) => {
  const { chatId } = req.params
  try {
    const leaveChat = await prisma.groupChat.update({
      where: { id: Number(chatId) },
      data: {
        users: {
          disconnect: { id: req.user.id }
        }
      }
    })

    res.json(leaveChat)
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
  getAllFriendRequests,
  deleteFriendRequest,
  acceptFriendRequest,
  ping,
  getUserChats,
  sendAllFriendsNotInGroupChat,
  addFriendToGroupChat,
  checkIfInChatMiddleware,
  leaveGroupChat,
  createGroupChat
}