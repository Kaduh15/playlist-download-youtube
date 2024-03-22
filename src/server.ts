import app from './app.js'
import { env } from './env.js'
const { PORT } = env

// Run the server!
app.listen({ port: PORT }, function (err) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
