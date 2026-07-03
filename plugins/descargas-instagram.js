
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply([
      `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
      `║`,
      `║ 💡 *Uso:* ${usedPrefix + command} <link>`,
      `║ 📌 *Ejemplo:* ${usedPrefix + command} https://www.instagram.com/p/...`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const query = text.trim()
  if (!query.includes('instagram.com')) {
    await m.react('❌')
    return m.reply('❌ *Link no válido.*\nAsegúrate de pegar un enlace de Instagram.')
  }

  await m.react('⏳')

  try {
    const apiUrl = `https://api.delirius.store/download/instagram?url=${encodeURIComponent(query)}`
    const res = await Promise.race([
      fetch(apiUrl),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
    ])
    const json = await res.json()

    if (!json.status || !json.data) throw new Error('No se pudo obtener el contenido')

    const data = json.data
    const tipo = data.type || 'desconocido'
    const titulo = data.title || data.caption || 'Sin título'
    const autor = data.author || data.username || 'Desconocido'
    const likes = data.likes || data.like_count || 0
    const comentarios = data.comments || data.comment_count || 0

    let mediaUrl = data.video_url || data.video || data.image_url || data.url
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      mediaUrl = data.images[0]
    }

    if (!mediaUrl) throw new Error('No se encontró el contenido')

    const esVideo = tipo === 'video' || data.video_url || data.video

    if (esVideo) {
      await conn.sendMessage(m.chat, {
        video: { url: mediaUrl },
        caption: [
          `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
          `║`,
          `║ ✅ *¡Descarga completada!*`,
          `║ 🎬 *Título:* ${titulo.slice(0, 50)}`,
          `║ 👤 *Autor:* ${autor}`,
          `║ ❤️ *Likes:* ${likes.toLocaleString()}`,
          `║ 💬 *Comentarios:* ${comentarios.toLocaleString()}`,
          `║`,
          `║ 💫 *Powered by TheEly-MD 🌼*`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: mediaUrl },
        caption: [
          `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
          `║`,
          `║ ✅ *¡Descarga completada!*`,
          `║ 🖼️ *Título:* ${titulo.slice(0, 50)}`,
          `║ 👤 *Autor:* ${autor}`,
          `║ ❤️ *Likes:* ${likes.toLocaleString()}`,
          `║ 💬 *Comentarios:* ${comentarios.toLocaleString()}`,
          `║`,
          `║ 💫 *Powered by TheEly-MD 🌼*`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error('❌ Error en instagram:', e.message)
    await m.react('❌')
    m.reply([
      `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
      `║`,
      `║ ❌ *Error al descargar~*`,
      `║ 🔄 Intenta de nuevo`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help = ['instagram <link>']
handler.tags = ['descargas']
handler.command = /^(instagram|ig|insta)$/i
handler.desc = 'Descarga videos, fotos y reels de Instagram'
handler.register = false
handler.limit = false

export default handler