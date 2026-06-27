const handler = async (m, { conn }) => {
  const start = Date.now()
  const msg   = await conn.sendMessage(m.chat, {
    text: `╔══〔 🌼 *THEELY-MD — PING* 〕══╗\n║\n║ 📡 Calculando latencia...\n║\n╚══════════════════════════════════╝`
  }, { quoted: m })

  const ping = Date.now() - start
  const uptime = process.uptime() * 1000

  const h = Math.floor(uptime / 3600000)
  const min = Math.floor(uptime / 60000) % 60
  const s = Math.floor(uptime / 1000) % 60
  const uptimeStr = `${String(h).padStart(2,'0')}h ${String(min).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`

  const estado = ping < 300 ? '🟢 Excelente' : ping < 700 ? '🟡 Normal' : '🔴 Lento'

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — PING* 〕══╗`,
      `║`,
      `║ 📡 *Latencia:*   ${ping} ms`,
      `║ 📶 *Estado:*     ${estado}`,
      `║ ⏱️  *Actividad:*  ${uptimeStr}`,
      `║ 🤖 *Bot:*        TheEly-MD`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'),
    edit: msg.key
  })

  await m.react('🏓')
}

handler.help    = ['ping']
handler.tags    = ['info']
handler.command = ['ping', 'speed', 'latencia']
handler.desc    = 'Muestra la latencia y estado del bot'

export default handler
