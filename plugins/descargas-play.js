import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

const API_KEY  = 'edward123'
const BASE_API = 'https://dv-edward.onrender.com'

let pendientes = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ➤ ${usedPrefix + command} <nombre canción>`,
    `║ ➤ ${usedPrefix + command} https://youtu.be/...`,
    `║`,
    `║ 📌 *Ejemplos:*`,
    `║ ➤ ${usedPrefix + command} Osuna`,
    `║ ➤ ${usedPrefix + command} TWICE`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const query  = text.trim()
  const isLink = query.includes('youtu.be') || query.includes('youtube.com')

  await m.react('🔎')

  try {
    if (isLink) {
      await procesarDescarga(m, conn, query)
      return
    }

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
        `║`,
        `║ 🔎 *Buscando:* ${query}`,
        `║ ⏳ Por favor espera~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    const searchUrl = `${BASE_API}/api/search/youtube?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`
    const res  = await fetch(searchUrl)
    const json = await res.json()

    if (!json.status || !json.data?.length) {
      await m.react('❌')
      return m.reply([
        `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
        `║`,
        `║ ❌ *Sin resultados para:*`,
        `║ 🔍 ${query}`,
        `║`,
        `║ 💡 Intenta con otro término~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'))
    }

    const results = json.data.slice(0, 5)

    pendientes[m.chat] = {
      type: 'search',
      results: results.map(v => ({ url: v.url, title: v.title }))
    }
    setTimeout(() => delete pendientes[m.chat], 120000)

    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣']

    const rows = results.map((v, i) => ({
      header: emojis[i],
      title: (v.title || 'Sin título').slice(0, 35),
      description: `⏱️ ${v.duration || 'N/A'}`,
      id: `play_select_${i}_${m.chat}`
    }))

    const bodyText = [
      `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
      `║`,
      `║ 🔎 *${query}*`,
      `║ 🎵 ${results.length} resultados`,
      `║`,
      `║ 👇 *Elige y descarga directo~*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    // ── Thumbnail del primer resultado ──
    let imageMessage = null
    const thumbnail = results[0]?.thumbnail || results[0]?.image || null
    if (thumbnail) {
      try {
        const { prepareWAMessageMedia } = await import('@whiskeysockets/baileys')
        const media = await prepareWAMessageMedia(
          { image: { url: thumbnail } },
          { upload: conn.waUploadToServer }
        )
        imageMessage = media.imageMessage
      } catch {}
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: '🌼 THEELY-MD — PLAY',
        subtitle: 'Elige tu canción~',
        hasMediaAttachment: !!imageMessage,
        ...(imageMessage && { imageMessage })
      },
      body: { text: bodyText },
      footer: { text: '💫 Powered by TheEly-MD 🌼' },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎵 Elige una canción',
            sections: [{ title: '🎶 RESULTADOS', rows }]
          })
        }]
      }
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      { viewOnceMessage: { message: { messageContextInfo: {}, interactiveMessage } } },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react('🎵')

  } catch (e) {
    console.error('❌ Error en play:', e)
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
      `║`,
      `║ ❌ *Error al buscar~*`,
      `║ 🔄 Intenta de nuevo`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

async function procesarDescarga(m, conn, url) {
  try {
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
        `║`,
        `║ ⏳ *Procesando audio...*`,
        `║ 💡 Esto puede tardar unos segundos~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    const apiUrl = `${BASE_API}/api/download/ytaudio?url=${encodeURIComponent(url)}&apiKey=${API_KEY}`
    const res  = await fetch(apiUrl)
    const data = await res.json()

    if (!data.status) throw new Error(data.error || 'Error en la API')

    const result = data.result || data
    const title  = result.title || 'audio'
    const audioUrl = result.download_url || result.url

    await conn.sendMessage(m.chat, {
      audio:    { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
        `║`,
        `║ ✅ *¡Audio enviado!*`,
        `║ 🎵 *${title.slice(0, 60)}*`,
        `║`,
        `║ 💫 *Powered by TheEly-MD 🌼*`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('❌ Error en descarga:', e)
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
      `║`,
      `║ ❌ *Error al descargar~*`,
      `║ 💡 Verifica que el link sea válido`,
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
    const id   = data.id || data.selectedId
    if (!id?.startsWith('play_select_')) return false

    const parts  = id.split('_')
    const index  = parseInt(parts[2])
    const chatId = parts.slice(3).join('_')

    const pend = pendientes[chatId]
    if (!pend) {
      await conn.sendMessage(m.chat, {
        text: [
          `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
          `║`,
          `║ ❌ *Búsqueda expirada~*`,
          `║ 💡 Usa *.play* de nuevo`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
      return true
    }

    const song = pend.results[index]
    if (!song) return false

    delete pendientes[chatId]
    await procesarDescarga(m, conn, song.url)

    return true

  } catch (e) {
    console.error('❌ Error en before play:', e)
    return false
  }
}

handler.help    = ['play <canción o link>']
handler.tags    = ['descargas']
handler.command = ['play', 'mp3', 'ytmp3', 'música']
handler.desc    = 'Busca y descarga música de YouTube'

export default handler
