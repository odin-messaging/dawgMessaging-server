import { createApp } from './app.js'

const app = createApp()

const PORT = process.env.PORT || 3000

app.listen(PORT, (error) => {
  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log(`My Express app - listening on port ${PORT}!`)
})