import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

function crearMensaje(chat, text, buttons, m, media = null) {
  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: {
      title: '🌼 THEELY-MD — INSTAGRAM',
      subtitle: 'Descarga videos, fotos y reels~',
      hasMediaAttachment: !!media?.imageMessage,
      ...(media?.imageMessage && { imageMessage: media.imageMessage })
    },
    body: { text },
    footer: { text: '💫 Powered by TheEly-MD 🌼' },
    nativeFlowMessage: { buttons }
  })

  return generateWAMessageFromContent(
    chat,
    { viewOnceMessage: { message: { messageContextInfo: {}, interactiveMessage } } },
    { quoted: m }
  )
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const bodyText = [
      `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ ➤ ${usedPrefix + command} <link directo>`,
      `║`,
      `║ 📌 *Ejemplos:*`,
      `║ ➤ ${usedPrefix + command} https://www.instagram.com/p/...`,
      `║ ➤ ${usedPrefix + command} https://www.instagram.com/reel/...`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    const buttons = [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '📸 Ayuda Instagram',
        sections: [{
          title: 'ℹ️ Información',
          rows: [{
            title: '📖 Cómo usar',
            description: 'Pega el link de la publicación',
            id: `ig_help_${m.chat}`
          }]
        }]
      })
    }]

    const msg = crearMensaje(m.chat, bodyText, buttons, m)
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return
  }

  const query = text.trim()
  const isDirectLink = query.includes('instagram.com')

  if (!isDirectLink) {
    await m.react('❌')
    return m.reply([
      `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
      `║`,
      `║ ❌ *Link no válido~*`,
      `║`,
      `║ 💡 Asegúrate de pegar el enlace`,
      `║ completo de la publicación.`,
      `║`,
      `║ 📌 Ejemplo:`,
      `║ .ig https://www.instagram.com/p/...`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  await m.react('⏳')

  try {
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
        `║`,
        `║ ⏳ *Descargando contenido...*`,
        `║ 💡 Por favor espera~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    const res = await Promise.race([
      fetch(`https://dv-edward-api.onrender.com/api/download/instagram?url=${encodeURIComponent(query)}&apiKey=edward123`),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
    ])
    const json = await res.json()

    if (!json.status || !json.data) {
      throw new Error('No se pudo obtener el contenido')
    }

    const data = json.data
    const tipo = data.type || 'desconocido'
    const titulo = data.title || data.caption || 'Sin título'
    const autor = data.author || data.username || 'Desconocido'
    const likes = data.likes || data.like_count || 0
    const comentarios = data.comments || data.comment_count || 0

    // Si es un video o reel
    if (tipo === 'video' || data.video_url || data.video) {
      const videoUrl = data.video_url || data.video || data.url
      if (!videoUrl) throw new Error('No se pudo obtener el video')

      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: [
          `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
          `║`,
          `║ ✅ *¡Descarga completada!*`,
          `║`,
          `║ 🎬 *Título:* ${titulo.slice(0, 50)}`,
          `║ 👤 *Autor:* ${autor}`,
          `║ ❤️ *Likes:* ${likes.toLocaleString()}`,
          `║ 💬 *Comentarios:* ${comentarios.toLocaleString()}`,
          `║`,
          `║ 💫 *Powered by TheEly-MD 🌼*`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })

      await m.react('✅')
      return
    }

    // Si es una imagen o carrusel
    if (tipo === 'image' || data.image_url || data.images || data.url) {
      let imageUrl = data.image_url || data.url
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        imageUrl = data.images[0]
      }

      if (!imageUrl) throw new Error('No se pudo obtener la imagen')

      await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: [
          `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
          `║`,
          `║ ✅ *¡Descarga completada!*`,
          `║`,
          `║ 🖼️ *Título:* ${titulo.slice(0, 50)}`,
          `║ 👤 *Autor:* ${autor}`,
          `║ ❤️ *Likes:* ${likes.toLocaleString()}`,
          `║ 💬 *Comentarios:* ${comentarios.toLocaleString()}`,
          `║`,
          `║ 💫 *Powered by TheEly-MD 🌼*`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })

      await m.react('✅')
      return
    }

    // Fallback: si no se detecta el tipo, intentar enviar lo que venga
    if (data.url) {
      await conn.sendMessage(m.chat, {
        document: { url: data.url },
        caption: [
          `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
          `║`,
          `║ ✅ *¡Descarga completada!*`,
          `║`,
          `║ 📎 *Contenido de Instagram*`,
          `║ 👤 *Autor:* ${autor}`,
          `║`,
          `║ 💫 *Powered by TheEly-MD 🌼*`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
      await m.react('✅')
      return
    }

    throw new Error('No se pudo obtener el contenido')

  } catch (e) {
    console.error('❌ Error en instagram:', e.message)
    await m.react('❌')
    m.reply([
      `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
      `║`,
      `║ ❌ *Error al descargar~*`,
      `║`,
      `║ 💡 *Posibles causas:*`,
      `║ ➤ Cuenta privada`,
      `║ ➤ Link incorrecto`,
      `║ ➤ API no disponible`,
      `║`,
      `║ 🔄 Intenta de nuevo~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || null
    if (!id) return false

    if (id.startsWith('ig_help_')) {
      await conn.sendMessage(m.chat, {
        text: [
          `╔══〔 📸 *THEELY-MD — INSTAGRAM* 〕══╗`,
          `║`,
          `║ 💡 *Envía el comando así:*`,
          `║ .ig https://www.instagram.com/p/...`,
          `║ .ig https://www.instagram.com/reel/...`,
          `║`,
          `║ 📌 También puedes usar:`,
          `║ .instagram <link>`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
      return true
    }

    return false

  } catch (e) {
    console.error('❌ Error en before instagram:', e.message)
    return true
  }
}

handler.help = ['instagram <link>']
handler.tags = ['descargas']
handler.command = /^(instagram|ig|insta)$/i
handler.desc = 'Descarga videos, fotos y reels de Instagram'
handler.register = false
handler.limit = false

export default handler