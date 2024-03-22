import z from 'zod'

export async function getHtml(url: string) {
  z.string().url().parse(url)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Erro ao fazer a requisição')
  }

  const html = await response.text()

  return html
}

export async function getLinksOfVideosFromPlaylist(playlistUrl: string) {
  z.string().url().parse(playlistUrl)
  const links: string[] = []

  const html = await getHtml(playlistUrl)

  new Set(html.match(/watch\?v=([a-zA-Z0-9_-]{11})/g)).forEach((match) => {
    links.push(`https://www.youtube.com/${match}`)
  })

  if (!links) {
    throw new Error('Não foi possível encontrar o link do vídeo')
  }

  return links
}
