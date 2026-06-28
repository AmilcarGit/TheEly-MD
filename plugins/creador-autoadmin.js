const handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (isAdmin) return m.reply([
    `╔══〔 🌼 *THEELY-MD — AUTOADMIN* 〕══╗`,
    `║`,
    `║ ⚠️ Ya eres admin en este grupo~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
    await m.react('👑')

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — AUTOADMIN* 〕══╗`,
        `║`,
        `║ 👑 *¡Coronado exitosamente!*`,
        `║`,
        `║ 🌼 @${m.sender.split('@')[0]}`,
        `║ ahora es administrador~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — AUTOADMIN* 〕══╗`,
      `║`,
      `║ ❌ *Ocurrió un error~*`,
      `║ No se pudo otorgar el rango.`,
      `║`,
      `║ 💡 Verifica que el bot sea admin`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.tags     = ['creador']
handler.help     = ['autoadmin']
handler.command  = ['autoadmin']
handler.rowner   = true
handler.group    = true
handler.botAdmin = true
handler.desc     = 'El owner se promueve a admin del grupo'

export default handler
