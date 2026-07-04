import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const nombreBot = global.namebot || 'TheEly-MD'

  if (!text || !text.trim()) {
    return conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot} — BARCODE* 〕══╗`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ ${usedPrefix + command} <texto o número>`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }

  const contenido = text.trim()

  if (contenido.length > 50) {
    return conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot} — BARCODE* 〕══╗`,
      `║`,
      `║ ⚠️ *Texto muy largo~*`,
      `║ Máximo 50 caracteres~`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }

  await m.react('⏳')

  try {
    const url = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(contenido)}&code=Code128&dpi=150`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`API respondió ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: [
        `╔══〔 🌼 *${nombreBot} — BARCODE* 〕══╗`,
        `║`,
        `║ 📦 *Contenido:* ${contenido}`,
        `║`,
        `╚══════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('❌ Error en barcode:', e)
    await m.react('❌')
    await conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot} — BARCODE* 〕══╗`,
      `║`,
      `║ ❌ *No se pudo generar el código~*`,
      `║ Intenta de nuevo más tarde~`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }
}

handler.command = ['barcode', 'codigobarras']
handler.help = ['barcode <texto>']
handler.tags = ['tools']
handler.desc = 'Genera un código de barras a partir de texto o números'

export default handler
