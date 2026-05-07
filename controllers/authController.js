import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const signup = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { username }
    })

    if (existing) {
      return res.status(409).json({ error: 'Username taken' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        avatar: {
          create: {
            style: 'rings',
            seed: 'seed'
          }
        },
        blurb: 'blub'
      }
    })

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })

    res.status(201).json(token)
  } catch (error) {
    console.error('SIGNUP ERROR:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })

    res.status(200).json(token)
  } catch (error) {
    console.error('LOGIN ERROR:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const sendMyProfile = async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateUser = async (req, res) => {
  const { updatedUser } = req.body
  try {

    const usernameTaken = await prisma.user.findFirst({
      where: {
        username: updatedUser.username,
        NOT: {
          id: Number(updatedUser.id)
        }
      }
    })

    if (usernameTaken) {
      return res.status(409).json({ error: 'Username taken' })
    }

    const user = await prisma.user.update({
      where: { id: Number(req.user.id) },
      include: { avatar: true },
      data: {
        blurb: updatedUser.blurb,
        username: updatedUser.username,
        avatar: {
          upsert: {
            update: {
              style: updatedUser.avatar.style,
              seed: updatedUser.avatar.seed
            },
            create: {
              style: updatedUser.avatar.style,
              seed: updatedUser.avatar.seed
            }
          }
        }
      }
    })

    res.json(user)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export {
  signup,
  login,
  sendMyProfile,
  updateUser
}