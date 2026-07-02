import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

const API_KEY  = 'edward123'
const BASE_API = 'https://dv-edward-api.onrender.com'

let pendientes = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ➤ ${usedPrefix + command} osuna`,
    `║ ➤ ${usedPrefix + command} TWICE`,
    `║ ➤ ${usedPrefix + command} https://youtu.be/...`,
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
      text: `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗\n║\n║ 🔎 Buscando: *${query}*\n║ ⏳ Por favor espera~\n║\n╚══════════════════════════════════╝`
    }, { quoted: m })

    const searchUrl = `${BASE_API}/api/search/youtube?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`
    const res  = await fetch(searchUrl)
    const json = await res.json()

    if (!json.status || !json.data?.length) {
      await m.react('❌')
      return m.reply(`❌ Sin resultados para: ${query}`)
    }

    const results = json.data.slice(0, 5)

    pendientes[m.chat] = {
      type: 'search',
      results: results.map(v => ({ url: v.url, title: v.title }))
    }

    setTimeout(() => delete pendientes[m.chat], 120000)

    const rows = results.map((v, i) => ({
      header: `${i + 1}️⃣`,
      title: (v.title || 'Sin título').slice(0, 35),
      description: `👤 ${v.author?.name || 'Desconocido'} | ⏱️ ${v.duration || 'N/A'}`,
      id: `play_select_${i}_${m.chat}`
    }))

    const bodyText = results.map((v, i) =>
      `• ${i + 1}. ${v.title}\n  👤 ${v.author?.name}\n  ⏱️ ${v.duration}`
    ).join('\n\n')

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      body: { text: bodyText },
      footer: { text: 'THEELY-MD' },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎵 Elegir canción',
            sections: [{
              title: 'RESULTADOS',
              rows
            }]
          })
        }]
      }
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      { viewOnceMessage: { message: { interactiveMessage } } },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react('🎵')

  } catch (e) {
    console.error(e)
    await m.reply('❌ Error en búsqueda')
  }
}

async function procesarDescarga(m, conn, url) {
  try {
    await conn.sendMessage(m.chat, {
      text: `⏳ Descargando audio...`
    }, { quoted: m })

    const apiUrl = `${BASE_API}/api/download/ytaudio?url=${encodeURIComponent(url)}&apiKey=${API_KEY}`
    const res  = await fetch(apiUrl)
    const data = await res.json()

    if (!data.status) throw new Error(data.error || 'Error API')

    const result = data.result || data

    const title = result.title || 'audio'

    // 🔥 ENVIAR DIRECTO SIN DESCARGAR A DISCO
    await conn.sendMessage(m.chat, {
      audio: { url: result.download_url || result.url },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: `✅ Audio enviado:\n🎵 ${title}`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Error al descargar audio')
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId

    if (!id?.startsWith('play_select_')) return false

    const parts = id.split('_')
    const index = parseInt(parts[2])
    const chatId = parts.slice(3).join('_')

    const pend = pendientes[chatId]
    if (!pend) return false

    const song = pend.results[index]
    if (!song) return false

    delete pendientes[chatId]
    await procesarDescarga(m, conn, song.url)

    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

handler.help = ['play']
handler.tags = ['descargas']
handler.command = ['play', 'mp3', 'ytmp3']

export default handler