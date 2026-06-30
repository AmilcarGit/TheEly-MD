
const handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  const link = args[0]

  if (!link) return m.reply([
    `╔══〔 🌼 *THEELY-MD — JOIN* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <link del grupo>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} https://chat.whatsapp.com/xxx`,
    `║`,
    `║ 💡 *Para sub-bots:*`,
    `║ ${usedPrefix + command} <link> @subbot`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (!link.includes('chat.whatsapp.com/')) return m.reply([
    `╔══〔 🌼 *THEELY-MD — JOIN* 〕══╗`,
    `║`,
    `║ ❌ *Link inválido~*`,
    `║ Debe ser un link de WhatsApp`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const code = link.split('chat.whatsapp.com/')[1]?.trim()
  if (!code) return m.reply(`❌ No se pudo extraer el código del link~`)

  // ── Determinar qué bot debe unirse ──
  const subBotMencionado = m.mentionedJid?.[0]
  let botObjetivo = conn

  if (subBotMencionado) {
    const subBot = global.conns?.find(c => c.user?.jid === subBotMencionado || c.user?.jid?.split(':')[0] + '@s.whatsapp.net' === subBotMencionado)
    if (!subBot) return m.reply([
      `╔══〔 🌼 *THEELY-MD — JOIN* 〕══╗`,
      `║`,
      `║ ❌ *Sub-bot no encontrado~*`,
      `║ Verifica que esté conectado`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
    botObjetivo = subBot
  }

  const nombreBot = subBotMencionado
    ? `@${subBotMencionado.split('@')[0].split(':')[0]}`
    : 'Bot Principal'

  await m.react('🔗')

  try {
    await botObjetivo.groupAcceptInvite(code)

    await m.react('✅')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — JOIN* 〕══╗`,
        `║`,
        `║ ✅ *¡Unido exitosamente!*`,
        `║`,
        `║ 🤖 *Bot:* ${nombreBot}`,
        `║ 🔗 *Link:* ${link}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: subBotMencionado ? [subBotMencionado] : []
    }, { quoted: m })

  } catch (e) {
    await m.react('❌')

    let mensajeError = 'Error desconocido~'
    if (e.message?.includes('401')) mensajeError = 'Link inválido o expirado~'
    else if (e.message?.includes('403')) mensajeError = 'Link revocado o sin permisos~'
    else if (e.message?.includes('408')) mensajeError = 'El grupo está lleno~'
    else if (e.message?.includes('409')) mensajeError = 'Ya es miembro del grupo~'

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — JOIN* 〕══╗`,
        `║`,
        `║ ❌ *No se pudo unir~*`,
        `║ ${mensajeError}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }
}

handler.help    = ['join <link>']
handler.tags    = ['owner']
handler.command = ['join', 'unirse']
handler.rowner  = true
handler.desc    = 'Une el bot o sub-bot a un grupo'

export default handler