import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — IP* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <ip o dominio>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} 8.8.8.8`,
    `║ ${usedPrefix + command} google.com`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  await m.react('🌐')

  try {
    const res  = await fetch(`https://ipapi.co/${text.trim()}/json/`)
    const data = await res.json()

    if (data.error) throw new Error(data.reason || 'IP/dominio inválido')

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — IP INFO* 〕══╗`,
        `║`,
        `║ 🌐 *IP:*         ${data.ip}`,
        `║ 🏙️  *Ciudad:*     ${data.city || 'N/A'}`,
        `║ 🗺️  *Región:*     ${data.region || 'N/A'}`,
        `║ 🌍 *País:*        ${data.country_name || 'N/A'} ${data.country_flag_emoji || ''}`,
        `║ 🕐 *Zona horaria:* ${data.timezone || 'N/A'}`,
        `║ 🏢 *Proveedor:*   ${data.org || 'N/A'}`,
        `║ 📍 *Coords:*      ${data.latitude}, ${data.longitude}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — IP* 〕══╗`,
      `║`,
      `║ ❌ *Error al consultar IP~*`,
      `║ ${e.message.slice(0, 80)}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help    = ['ip <dirección>']
handler.tags    = ['tools']
handler.command = ['ip', 'ipinfo', 'geoip']
handler.desc    = 'Obtiene información de una IP o dominio'
export default handler
