import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — QR* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <texto o link>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} https://google.com`,
    `║ ${usedPrefix + command} Hola mundo`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  await m.react('🔳')

  try {
    const contenido = encodeURIComponent(text.trim())
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${contenido}`

    await conn.sendMessage(m.chat, {
      image: { url: qrUrl },
      caption: [
        `╔══〔 🌼 *THEELY-MD — QR* 〕══╗`,
        `║`,
        `║ ✅ *Código QR generado~*`,
        `║`,
        `║ 📝 *Contenido:*`,
        `║ ${text.trim().slice(0, 80)}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — QR* 〕══╗`,
      `║`,
      `║ ❌ *Error al generar el QR~*`,
      `║ Intenta de nuevo`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help    = ['qr <texto o link>']
handler.tags    = ['tools']
handler.command = ['qr', 'generarqr', 'crearqr']
handler.desc    = 'Genera un código QR de cualquier texto o link'
export default handler
