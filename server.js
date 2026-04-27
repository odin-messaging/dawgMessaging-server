import createApp from './app.js'

if (process.env.NODE_ENV !== 'test') {
  const app = createApp()
  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => {
    console.log(`My Express app - listening on port ${PORT}!`)
  })
}