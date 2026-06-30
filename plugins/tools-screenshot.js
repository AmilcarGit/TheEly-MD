import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — SCREENSHOT* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <url>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} https://google.com`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  let url = text.trim()
  if (!/^https?:\/\//.test(url)) url = `https://${url}`

  await m.react('📸')

  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`

    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('No se pudo capturar la página')

    const imageUrl = res.url

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: [
        `╔══〔 🌼 *THEELY-MD — SCREENSHOT* 〕══╗`,
        `║`,
        `║ 📸 *¡Captura completada!*`,
        `║`,
        `║ 🔗 *URL:* ${url}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — SCREENSHOT* 〕══╗`,
      `║`,
      `║ ❌ *No se pudo capturar la página~*`,
      `║ Verifica que la URL sea válida`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help    = ['screenshot <url>']
handler.tags    = ['tools']
handler.command = ['screenshot', 'ss', 'capturaweb']
handler.desc    = 'Captura una página web'

export default handler
