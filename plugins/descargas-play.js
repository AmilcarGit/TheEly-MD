import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

const API_KEY  = 'EdwardwEqIgrqU'
const BASE_API = 'https://dv-edward-api.onrender.com/api/download/ytaudio?url'
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
    const res  = await fetch(searchUrl, {
      headers: { 'accept': 'application/json', 'user-agent': 'Mozilla/5.0' }
    })
    const json = await res.json()

    if (!json.status || !Array.isArray(json.data) || json.data.length === 0) {
      await m.react('❌')
      return m.reply([
        `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
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

    const rows = results.map((v, i) => {
      const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣']
      const titulo = (v.title || 'Sin título').slice(0, 35)
      const autor  = v.author?.name || 'Desconocido'
      const dur    = v.duration || 'N/A'
      const vistas = Number(v.views || 0).toLocaleString()

      return {
        header: emojis[i],
        title: titulo,
        description: `👤 ${autor} | ⏱️ ${dur} | 👀 ${vistas}`,
        id: `play_select_${i}_${m.chat}`
      }
    })

    const bodyText = [
      `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
      `║`,
      `║ 🔎 *Resultados para:* ${query}`,
      `║ 🎵 *${results.length} canciones encontradas*`,
      `║`,
      ...results.map((v, i) => [
        `║ ${['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'][i]} *${(v.title||'Sin título').slice(0,40)}*`,
        `║   👤 ${v.author?.name || 'Desconocido'}`,
        `║   ⏱️ ${v.duration || 'N/A'}  👀 ${Number(v.views||0).toLocaleString()}`,
        `║`
      ]).flat(),
      `║ 👇 *Elige y descarga directo~*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: '🌼 THEELY-MD — PLAY',
        subtitle: 'Elige y descarga~',
        hasMediaAttachment: false
      },
      body: { text: bodyText },
      footer: { text: '💫 Powered by TheEly-MD 🌼' },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎵 Elige una canción',
            sections: [{
              title: '🎶 RESULTADOS',
              rows
            }]
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
    console.error('❌ Error en play:', e.message)
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
      `║`,
      `║ ❌ *Error al procesar~*`,
      `║ 🔄 Intenta de nuevo`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

async function procesarDescarga(m, conn, url) {
  try {
    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗\n║\n║ ⏳ *Descargando audio...*\n║ 💡 Esto puede tardar unos segundos~\n║\n╚══════════════════════════════════╝`
    }, { quoted: m })

    const apiUrl = `${BASE_API}/api/download/ytaudio?url=${encodeURIComponent(url)}&apiKey=${API_KEY}`
    const res    = await fetch(apiUrl)
    const data   = await res.json()

    if (!data.status) throw new Error(data.error || 'Error al obtener audio')

    const { title, duration, download_url } = data.result
    const min    = Math.floor(duration / 60)
    const seg    = duration % 60
    const durStr = `${min}:${String(seg).padStart(2, '0')}`

    const tmpDir    = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const audioPath = path.join(tmpDir, `${Date.now()}.mp3`)
    const audioRes  = await fetch(download_url)
    fs.writeFileSync(audioPath, Buffer.from(await audioRes.arrayBuffer()))

    await conn.sendMessage(m.chat, {
      audio:    fs.readFileSync(audioPath),
      mimetype: 'audio/mpeg',
      ptt:      false,
      fileName: `${title}.mp3`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗`,
        `║`,
        `║ ✅ *¡Audio enviado!*`,
        `║ 🎵 *${title}*`,
        `║ ⏱️ *${durStr}*`,
        `║`,
        `║ 💫 *Powered by TheEly-MD 🌼*`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    fs.unlinkSync(audioPath)
    await m.react('✅')

  } catch (e) {
    console.error('❌ Error en descarga:', e.message)
    await m.react('❌')
    m.reply(`❌ Error al procesar el audio~\n💡 Verifica que el enlace sea válido`)
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id   = data.id || data.selectedId || null
    if (!id) return false

    if (id.startsWith('play_select_')) {
      const parts  = id.split('_')
      const index  = parseInt(parts[2])
      const chatId = parts.slice(3).join('_')
      const pend   = pendientes[chatId]

      if (!pend || pend.type !== 'search') {
        await conn.sendMessage(m.chat, {
          text: `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗\n║\n║ ❌ Búsqueda expirada~\n║ 💡 Usa *.play* de nuevo\n║\n╚══════════════════════════════════╝`
        }, { quoted: m })
        return true
      }

      const cancion = pend.results[index]
      if (!cancion) return true

      delete pendientes[chatId]
      await procesarDescarga(m, conn, cancion.url)
      return true
    }

    return false

  } catch (e) {
    console.error('❌ Error en before play:', e.message)
    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD — PLAY* 〕══╗\n║\n║ ❌ Error inesperado~\n║ 💡 Intenta de nuevo\n║\n╚══════════════════════════════════╝`
    }, { quoted: m })
    await m.react('❌')
    return true
  }
}

handler.help    = ['play <canción o link>']
handler.tags    = ['descargas']
handler.command = ['play', 'mp3', 'música', 'ytmp3']
handler.desc    = 'Busca y descarga música de YouTube'

export default handler
