import Fastify from 'fastify'

import { ZodError, z } from 'zod'
import ytdl from 'ytdl-core'
import { getLinksOfVideosFromPlaylist } from './scraping/index.js'

async function getDownloadLink(videoUrl: string) {
  if (!ytdl.validateURL(videoUrl)) {
    throw new Error('URL do vídeo do YouTube inválida')
  }

  const info = await ytdl.getInfo(videoUrl)
  const formats = info.formats.find((format) => format.container === 'webm')

  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highest',
    filter: 'audio',
    format: formats,
  })

  const downloadLink = format.url

  return {
    downloadLink,
    title: info.videoDetails.title,
    author: info.videoDetails.author.name,
    thumbnails: info.videoDetails.thumbnails,
    videoUrl,
  }
}

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

  const linksVideos = (await getLinksOfVideosFromPlaylist(videoUrl)).map(
    (link) => getDownloadLink(link),
  )

  const linksDownload = await Promise.all(linksVideos)

  reply.send({ linksDownload })
})

export default fastify
