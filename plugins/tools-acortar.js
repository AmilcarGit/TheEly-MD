import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — ACORTAR* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <url>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} https://google.com`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const url = text.trim()
  if (!/^https?:\/\//.test(url)) return m.reply(`❌ Ingresa una URL válida (con https://)~`)

  await m.react('🔗')

  try {
    const res  = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
    const corto = await res.text()

    if (!corto || !corto.startsWith('http')) throw new Error('No se pudo acortar')

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — ACORTAR* 〕══╗`,
        `║`,
        `║ 🔗 *URL acortada~*`,
        `║`,
        `║ 📎 *Original:*`,
        `║ ${url.slice(0, 60)}${url.length > 60 ? '...' : ''}`,
        `║`,
        `║ ✅ *Acortada:*`,
        `║ ${corto}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — ACORTAR* 〕══╗`,
      `║`,
      `║ ❌ *Error al acortar~*`,
      `║ Verifica que la URL sea válida`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help    = ['acortar <url>']
handler.tags    = ['tools']
handler.command = ['acortar', 'shorturl', 'tinyurl']
handler.desc    = 'Acorta una URL con TinyURL'
export default handler
