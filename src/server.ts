import app from './app.js'

// Run the server!
app.listen({ port: 3000 }, function (err) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
