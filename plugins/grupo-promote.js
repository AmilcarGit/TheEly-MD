let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos 🌼')
  if (!isBotAdmin) return m.reply('❌ El bot necesita ser admin 🌼')
  if (!isAdmin) return m.reply('❌ Solo los admins pueden usar este comando 🌼')

  let who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)
  if (!who) return m.reply([
    `╔══〔 🌼 *THEELY-MD — PROMOTE* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ .promote @usuario`,
    `║ O responde a un mensaje~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const metadata = await conn.groupMetadata(m.chat).catch(() => null)
  if (!metadata) return m.reply('❌ No pude obtener info del grupo 🌼')

  const whoData = metadata.participants.find(p =>
    p.id === who ||
    p.id?.split(':')[0] + '@s.whatsapp.net' === who
  )
  if (!whoData) return m.reply('❌ Ese usuario no está en el grupo 🌼')

  const botJid = conn.user.jid.includes(':')
    ? conn.user.jid.split(':')[0] + '@s.whatsapp.net'
    : conn.user.jid

  if (who === botJid) return m.reply('💖 Ya soy admin~ 🌼')

  if (whoData.admin === 'admin' || whoData.admin === 'superadmin') {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — PROMOTE* 〕══╗`,
      `║`,
      `║ ⚠️ @${who.split('@')[0]} ya es admin~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — PROMOTE* 〕══╗`,
        `║`,
        `║ ✅ *¡Usuario promovido!*`,
        `║`,
        `║ 👑 @${who.split('@')[0]}`,
        `║ 🎉 *¡Ahora eres admin!*`,
        `║`,
        `║ 💫 Usa tu poder con sabiduría~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [who]
    }, { quoted: m })

    await m.react('👑')

  } catch (e) {
    m.reply('❌ No pude promover al usuario\n💡 Asegúrate que el bot es admin 🌼')
  }
}

handler.help = ['promote <@usuario>']
handler.tags = ['grupo']
handler.command = ['promote', 'ascender']
handler.admin = true
handler.botAdmin = true
handler.desc = 'Promueve a un usuario a admin'

export default handler
