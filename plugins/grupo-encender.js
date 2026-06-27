const handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat]

  if (!chat.isBanned) {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD* 〕══╗`,
      `║`,
      `║ ✅ El bot ya está activo~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  chat.isBanned = false

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD* 〕══╗`,
      `║`,
      `║ 🟢 *Bot activado~*`,
      `║`,
      `║ ¡Hola de nuevo! 🌼`,
      `║ Ya puedo responder comandos`,
      `║ en este grupo.`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🟢')
}

handler.help    = ['encender']
handler.tags    = ['grupo']
handler.command = ['encender', 'activar', 'onbot']
handler.group   = true
handler.rowner  = true
handler.desc    = 'Enciende el bot en el grupo actual (solo owner)'

export default handler
