import Fastify from 'fastify'
import { ZodError, z } from 'zod'
import ytdl from 'ytdl-core'

const fastify = Fastify({
  logger: true,
})

fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      ok: false,
      error: error.errors.map((err) => ({
        message: err.message,
      })),
    })
  }

  reply.status(500).send({ ok: false })
})

fastify.get('/', async function (request, reply) {
  const { url: videoUrl } = z
    .object({
      url: z
        .string({
          required_error: 'URL do vídeo do YouTube não fornecida',
        })
        .url(),
    })
    .parse(request.query)
  if (!ytdl.validateURL(videoUrl)) {
    reply.code(400).send({ error: 'URL do vídeo do YouTube inválida' })
    return
  }

  const info = await ytdl.getInfo(videoUrl)

  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highest',
    filter: 'audioonly',
  })

  // Construir o link de download
  const downloadLink = format.url

  reply.send({ downloadLink })
})

// Run the server!
fastify.listen({ port: 3000 }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
