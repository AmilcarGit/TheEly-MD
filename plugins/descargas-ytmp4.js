import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

let pendientes = {}

// ===== CONFIGURACIÓN =====
const API_DESCARGAR = 'https://dv-yer-api.online/ytmp4'
const API_KEY = 'dvyer673989047548'
const QUALITY = '360p'

// API de búsqueda (Delirius, que funciona)
const BUSQUEDA_API = 'https://api.delirius.store/search/youtube'

const TIMEOUT_MS = 45000

function fetchConTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ➤ ${usedPrefix + command} <nombre del video>`,
    `║ ➤ ${usedPrefix + command} https://youtu.be/...`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const query = text.trim()
  const isLink = query.includes('youtu.be') || query.includes('youtube.com')

  await m.react('⏳')

  try {
    if (isLink) {
      await procesarVideo(m, conn, query)
      return
    }

    // ===== BÚSQUEDA CON DELIRIUS =====
    console.log(`🔍 Buscando: ${query}`)
    const searchUrl = `${BUSQUEDA_API}?query=${encodeURIComponent(query)}`
    const res = await fetchConTimeout(searchUrl, {
      headers: { 'accept': 'application/json', 'user-agent': 'Mozilla/5.0' }
    })
    const json = await res.json()
    console.log('📦 Respuesta búsqueda:', JSON.stringify(json, null, 2))

    if (!json.status || !Array.isArray(json.data) || json.data.length === 0) {
      await m.react('❌')
      return m.reply([
        `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗`,
        `║`,
        `║ ❌ Sin resultados para:`,
        `║ 🔍 *${query}*`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'))
    }

    const results = json.data.slice(0, 5)

    pendientes[m.chat] = {
      type: 'search',
      results: results.map(v => ({ url: v.url, title: v.title }))
    }
    setTimeout(() => { delete pendientes[m.chat] }, 120000)

    const rows = results.map((v, i) => ({
      title: (v.title || 'Sin título').slice(0, 50),
      description: `👤 ${v.author?.name || 'Desconocido'}  ⏱️ ${v.duration || 'N/A'}`,
      id: `vtmp4_select_${i}_${m.chat}`
    }))

    const primerVideo = results[0]
    let imageMessage = null

    if (primerVideo?.thumbnail) {
      try {
        const media = await prepareWAMessageMedia(
          { image: { url: primerVideo.thumbnail } },
          { upload: conn.waUploadToServer }
        )
        imageMessage = media.imageMessage
      } catch (e) {}
    }

    const bodyText = [
      `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗`,
      `║`,
      `║ 🔎 *Resultados para:* ${query}`,
      `║ 🎬 *${results.length} videos encontrados*`,
      `║`,
      `║ 👇 *Elige y descarga directo~*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: '🌼 THEELY-MD — YTMP4',
        subtitle: 'Elige y descarga~',
        hasMediaAttachment: !!imageMessage,
        ...(imageMessage && { imageMessage })
      },
      body: { text: bodyText },
      footer: { text: '💫 Powered by THEELY-MD 🌼' },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎬 Elige un video',
            sections: [{ title: '🎥 RESULTADOS', rows }]
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
    await m.react('🎬')

  } catch (e) {
    console.error('❌ Error en ytmp4:', e.message)
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗`,
      `║`,
      `║ ❌ *Error al procesar~*`,
      `║ 🔄 Intenta de nuevo`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

// ===== DESCARGA DE VIDEO USANDO LA NUEVA API =====
async function procesarVideo(m, conn, url) {
  let videoPath = null
  try {
    const apiUrl = `${API_DESCARGAR}?mode=link&url=${encodeURIComponent(url)}&quality=${QUALITY}&apikey=${API_KEY}`
    console.log('📡 Descargando desde:', apiUrl)

    const res = await fetchConTimeout(apiUrl, {
      headers: { 'accept': 'application/json', 'user-agent': 'Mozilla/5.0' }
    })
    const data = await res.json()
    console.log('📦 Respuesta descarga:', JSON.stringify(data, null, 2))

    if (!data.ok) {
      throw new Error(data.error || 'Error al obtener el video')
    }

    const { title, download_url, thumbnail } = data

    if (!download_url) {
      throw new Error('No se encontró URL de descarga')
    }

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    videoPath = path.join(tmpDir, `${Date.now()}.mp4`)

    console.log('⬇️ Descargando archivo...')
    const videoRes = await fetchConTimeout(download_url)
    if (!videoRes.ok || !videoRes.body) {
      throw new Error('No se pudo descargar el video')
    }

    await pipeline(videoRes.body, fs.createWriteStream(videoPath))
    console.log('✅ Archivo descargado, enviando...')

    await conn.sendMessage(m.chat, {
      document: { url: videoPath },
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption: [
        `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗`,
        `║`,
        `║ ✅ *Video descargado*`,
        `║ 🎬 *${title}*`,
        `║`,
        `║ 💫 *Powered by THEELY-MD 🌼*`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('❌ Error en descarga de video:', e.message)
    await m.react('❌')
    m.reply(`❌ Error al procesar el video~\n💡 Verifica que el enlace sea válido`)
  } finally {
    if (videoPath) {
      try { await fs.promises.unlink(videoPath) } catch {}
    }
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId
    if (!id) return false

    if (id.startsWith('vtmp4_select_')) {
      const parts = id.split('_')
      const index = parseInt(parts[2])
      const chatId = parts.slice(3).join('_')
      const pend = pendientes[chatId]

      if (!pend || pend.type !== 'search') {
        await conn.sendMessage(m.chat, {
          text: `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗\n║\n║ ❌ Búsqueda expirada~\n║ 💡 Usa *.ytmp4* de nuevo\n║\n╚══════════════════════════════════╝`
        }, { quoted: m })
        return true
      }

      const video = pend.results[index]
      if (!video) return true

      delete pendientes[chatId]
      await m.react('⏳')
      await procesarVideo(m, conn, video.url)
      return true
    }

    return false

  } catch (e) {
    console.error('❌ Error en before ytmp4:', e.message)
    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗\n║\n║ ❌ Error inesperado~\n║ 💡 Intenta de nuevo\n║\n╚══════════════════════════════════╝`
    }, { quoted: m })
    await m.react('❌')
    return true
  }
}

handler.help = ['ytmp4 <nombre o link>']
handler.tags = ['descargas']
handler.command = ['ytmp4', 'video', 'ytvideo']
handler.desc = 'Busca y descarga videos de YouTube'
handler.register = false
handler.limit = false

export default handler