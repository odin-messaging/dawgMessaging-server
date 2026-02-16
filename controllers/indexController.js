// import { prisma } from "../lib/prisma.js"

const test = (req, res) => {
  res.status(200).json({ msg: 'test'})
}

export {
  test
}