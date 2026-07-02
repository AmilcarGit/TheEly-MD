import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

function crearMensaje(chat, text, buttons, m, media = null) {
  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: {
      title: '🌼 THEELY-MD — TIKTOK',
      subtitle: 'Busca y descarga videos~',
      hasMediaAttachment: !!media,
      imageMessage: media?.imageMessage
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
      `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ ➤ ${usedPrefix + command} <búsqueda>`,
      `║ ➤ ${usedPrefix + command} <link directo>`,
      `║`,
      `║ 📌 *Ejemplos:*`,
      `║ ➤ ${usedPrefix + command} baile viral`,
      `║ ➤ ${usedPrefix + command} tiktok.com/...`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    const buttons = [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🎬 TikTok Search',
        sections: [{
          title: '🔍 Buscar',
          rows: [{
            header: '🎬 VIDEO',
            title: 'Buscar video',
            description: 'Escribe el nombre o pega un link',
            id: `tt_help_${m.chat}`
          }]
        }]
      })
    }]

    const msg = crearMensaje(m.chat, bodyText, buttons, m)
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return
  }

  const query = text.trim()
  const isDirectLink = query.includes('tiktok.com') || query.includes('vm.tiktok.com')

  if (isDirectLink) {
    await m.react('⏳')

    try {
      await conn.sendMessage(m.chat, {
        text: [
          `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
          `║`,
          `║ ⏳ *Descargando video...*`,
          `║ 💡 Por favor espera~`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })

      const res  = await Promise.race([
        fetch(`https://api.delirius.store/download/tiktok?url=${encodeURIComponent(query)}`),
        new Promise((_, rej) => setTimeout(() => rej('timeout'), 15000))
      ])
      const json = await res.json()

      if (!json.status || !json.data?.meta?.media?.[0]?.org) throw new Error('No se pudo obtener el video')

      const videoUrl = json.data.meta.media[0].org
      const titulo   = json.data.title || 'Sin título'
      const autor    = json.data.author?.nickname || 'Desconocido'
      const duracion = json.data.duration || '?'

      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: [
          `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
          `║`,
          `║ ✅ *¡Descarga completada!*`,
          `║`,
          `║ 🎬 *Título:* ${titulo.slice(0, 50)}`,
          `║ 👤 *Autor:* ${autor}`,
          `║ ⏱️ *Duración:* ${duracion}s`,
          `║`,
          `║ 💫 *Powered by TheEly-MD 🌼*`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {
      console.error('❌ Error en tiktok dl:', e.message)
      await m.react('❌')
      m.reply([
        `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
        `║`,
        `║ ❌ *Error al descargar~*`,
        `║`,
        `║ 💡 *Posibles causas:*`,
        `║ ➤ Video privado o eliminado`,
        `║ ➤ Link incorrecto`,
        `║ ➤ API no disponible`,
        `║`,
        `║ 🔄 Intenta de nuevo~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'))
    }
    return
  }

  await m.react('🔍')

  try {
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
        `║`,
        `║ 🔍 *Buscando:* ${query}`,
        `║ ⏳ Por favor espera~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    const searchRes  = await Promise.race([
      fetch(`https://api.delirius.store/search/tiktoksearch?query=${encodeURIComponent(query)}`),
      new Promise((_, rej) => setTimeout(() => rej('timeout'), 15000))
    ])
    const searchData = await searchRes.json()

    if (!searchData.status || !searchData.meta?.length) throw new Error('Sin resultados')

    const resultados = searchData.meta.slice(0, 10)

    let media = null
    const primeraImg = resultados[0]?.author?.avatar || ''
    if (primeraImg) {
      try {
        media = await prepareWAMessageMedia(
          { image: { url: primeraImg } },
          { upload: conn.waUploadToServer }
        )
      } catch {}
    }

    const rows = resultados.map((video, i) => {
      const urlB64   = Buffer.from(video.url || '').toString('base64')
      const titleB64 = Buffer.from((video.title || '').slice(0, 30)).toString('base64')
      return {
        header: `${['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'][i]} ${video.author?.nickname || 'Desconocido'}`,
        title:  (video.title || 'Sin título').slice(0, 35),
        description: `⏱️ ${video.duration || '?'}s | ❤️ ${(video.like || 0).toLocaleString()}`,
        id: `ttdl_${i}_${urlB64}_${titleB64}`
      }
    })

    const listaTexto = resultados.map((v, i) => [
      `║ ${['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'][i]} *${(v.title || 'Sin título').slice(0, 35)}*`,
      `║   👤 ${v.author?.nickname || 'Desconocido'}`,
      `║   ⏱️ ${v.duration || '?'}s  ❤️ ${(v.like || 0).toLocaleString()}`,
      `║`
    ]).flat()

    const bodyText = [
      `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
      `║`,
      `║ 🔍 *Búsqueda:* ${query}`,
      `║ 📊 *Resultados:* ${resultados.length}`,
      `║`,
      ...listaTexto,
      `║ 👇 *Elige un video~*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    const buttons = [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🎬 Elige un video',
        sections: [{ title: `📋 ${query.toUpperCase()}`, rows }]
      })
    }]

    const msg = crearMensaje(m.chat, bodyText, buttons, m, media)
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('❌ Error en tiktok search:', e.message)
    await m.react('❌')
    m.reply([
      `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
      `║`,
      `║ ❌ *Sin resultados para:*`,
      `║ 🔍 ${query}`,
      `║`,
      `║ 💡 Intenta con otro término~`,
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
    const id   = data.id || data.selectedId || null
    if (!id) return false

    if (id.startsWith('tt_help_')) {
      await conn.sendMessage(m.chat, {
        text: [
          `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
          `║`,
          `║ 💡 *Envía el comando así:*`,
          `║ .tiktok baile viral`,
          `║ .tiktok tiktok.com/...`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
      return true
    }

    if (!id.startsWith('ttdl_')) return false

    const parts    = id.split('_')
    const urlB64   = parts[2]
    const titleB64 = parts[3]
    const videoUrl = Buffer.from(urlB64,   'base64').toString()
    const titulo   = Buffer.from(titleB64, 'base64').toString()

    await m.react('⏳')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
        `║`,
        `║ ⏳ *Descargando video...*`,
        `║ 🎬 ${titulo.slice(0, 40) || 'TikTok'}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    const res  = await Promise.race([
      fetch(`https://api.delirius.store/download/tiktok?url=${encodeURIComponent(videoUrl)}`),
      new Promise((_, rej) => setTimeout(() => rej('timeout'), 20000))
    ])
    const json = await res.json()

    if (!json.status || !json.data?.meta?.media?.[0]?.org) throw new Error('No se pudo descargar el video')

    const videoDownloadUrl = json.data.meta.media[0].org
    const tituloFinal      = json.data.title || titulo || 'Sin título'
    const autorFinal       = json.data.author?.nickname || 'Desconocido'
    const duracionFinal    = json.data.duration || '?'

    await conn.sendMessage(m.chat, {
      video: { url: videoDownloadUrl },
      caption: [
        `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
        `║`,
        `║ ✅ *¡Descarga completada!*`,
        `║`,
        `║ 🎬 *Título:* ${tituloFinal.slice(0, 50)}`,
        `║ 👤 *Autor:* ${autorFinal}`,
        `║ ⏱️ *Duración:* ${duracionFinal}s`,
        `║`,
        `║ 💫 *Powered by TheEly-MD 🌼*`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')
    return true

  } catch (e) {
    console.error('❌ Error en before tiktok:', e.message)
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🎬 *THEELY-MD — TIKTOK* 〕══╗`,
        `║`,
        `║ ❌ *Error al descargar~*`,
        `║ 🔄 Intenta de nuevo`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
    await m.react('❌')
    return true
  }
}

handler.help    = ['tiktok <búsqueda o link>']
handler.tags    = ['descargas']
handler.command = /^(tiktok|tt)$/i
handler.desc    = 'Busca y descarga videos de TikTok'

export default handler
