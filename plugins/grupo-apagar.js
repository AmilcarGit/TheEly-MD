const handler = async (m, { conn, isOwner, isAdmin }) => {
  const chat = global.db.data.chats[m.chat]

  if (chat.isBanned) {
    if (!isOwner) return

    chat.isBanned = false
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD* 〕══╗`,
        `║`,
        `║ ✅ *Bot activado~*`,
        `║ Ya puedo responder en`,
        `║ este grupo nuevamente 🌼`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')
    return
  }

  if (!isAdmin && !isOwner) {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD* 〕══╗`,
      `║`,
      `║ ❌ Solo los admins pueden`,
      `║ apagar el bot en este grupo~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  chat.isBanned = true

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD* 〕══╗`,
      `║`,
      `║ 🔴 *Bot desactivado~*`,
      `║`,
      `║ Ya no responderé comandos`,
      `║ en este grupo.`,
      `║`,
      `║ 💡 Para reactivarme:`,
      `║ *#encender* (solo owner)`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🔴')
}

handler.help    = ['apagar']
handler.tags    = ['grupo']
handler.command = ['apagar', 'desactivar', 'offbot']
handler.group   = true
handler.admin   = true
handler.desc    = 'Apaga el bot en el grupo actual'

export default handler
