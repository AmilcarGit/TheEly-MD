import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

let pendientes = {}
const API_URL    = 'https://api.delirius.store/download/ytmp4'
const API_KEY    = 'EdwardwEqIgrqU'
const BASE_API   = 'https://dv-edward-api.onrender.com'

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

  const query  = text.trim()
  const isLink = query.includes('youtu.be') || query.includes('youtube.com')

  await m.react('🎬')

  try {
    // ── LINK DIRECTO ──
    if (isLink) {
      await procesarVideo(m, conn, query)
      return
    }

    // ── BÚSQUEDA ──
    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗\n║\n║ 🔎 Buscando: *${query}*\n║ ⏳ Por favor espera~\n║\n╚══════════════════════════════════╝`
    }, { quoted: m })

    const searchUrl = `${BASE_API}/api/search/youtube?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`
    const res  = await fetch(searchUrl, {
      headers: { 'accept': 'application/json', 'user-agent': 'Mozilla/5.0' }
    })
    const json = await res.json()

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
      header: ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'][i],
      title: (v.title || 'Sin título').slice(0, 35),
      description: `👤 ${v.author?.name || 'Desconocido'} | ⏱️ ${v.duration || 'N/A'} | 👀 ${Number(v.views||0).toLocaleString()}`,
      id: `vtmp4_select_${i}_${m.chat}`
    }))

    const bodyText = [
      `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗`,
      `║`,
      `║ 🔎 *Resultados para:* ${query}`,
      `║ 🎬 *${results.length} videos encontrados*`,
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
      header: { title: '🌼 THEELY-MD — YTMP4', subtitle: 'Elige y descarga~', hasMediaAttachment: false },
      body: { text: bodyText },
      footer: { text: '💫 Powered by TheEly-MD 🌼' },
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

async function procesarVideo(m, conn, url) {
  try {
    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗\n║\n║ ⏳ *Procesando video...*\n║ 💡 Esto puede tardar unos segundos~\n║\n╚══════════════════════════════════╝`
    }, { quoted: m })

    const res  = await fetch(`${API_URL}?url=${encodeURIComponent(url)}`)
    const data = await res.json()

    if (!data.status) throw new Error(data.error || 'Error al obtener el video')

    const { title, image: thumbnail, download } = data.data

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const videoPath = path.join(tmpDir, `${Date.now()}.mp4`)
    const videoRes  = await fetch(download)
    fs.writeFileSync(videoPath, Buffer.from(await videoRes.arrayBuffer()))

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(videoPath),
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗`,
        `║`,
        `║ ✅ *¡Video enviado!*`,
        `║ 🎬 *${title}*`,
        `║`,
        `║ 💫 *Powered by TheEly-MD 🌼*`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    fs.unlinkSync(videoPath)
    await m.react('✅')

  } catch (e) {
    console.error('❌ Error en descarga de video:', e.message)
    await m.react('❌')
    m.reply(`❌ Error al procesar el video~\n💡 Verifica que el enlace sea válido`)
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id   = data.id || data.selectedId || data.selectedRowId
    if (!id) return false

    if (id.startsWith('vtmp4_select_')) {
      const parts  = id.split('_')
      const index  = parseInt(parts[2])
      const chatId = parts.slice(3).join('_')
      const pend   = pendientes[chatId]

      if (!pend || pend.type !== 'search') {
        await conn.sendMessage(m.chat, {
          text: `╔══〔 🌼 *THEELY-MD — YTMP4* 〕══╗\n║\n║ ❌ Búsqueda expirada~\n║ 💡 Usa *.ytmp4* de nuevo\n║\n╚══════════════════════════════════╝`
        }, { quoted: m })
        return true
      }

      const video = pend.results[index]
      if (!video) return true

      delete pendientes[chatId]
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

handler.help    = ['ytmp4 <nombre o link>']
handler.tags    = ['descargas']
handler.command = ['ytmp4', 'video', 'ytvideo']
handler.desc    = 'Busca y descarga videos de YouTube'

export default handler
