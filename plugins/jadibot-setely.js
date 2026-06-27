import ws from 'ws'

const handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos 🌼')
  if (!isAdmin) return m.reply('❌ Solo los admins pueden usar este comando 🌼')

  const chat = global.db.data.chats[m.chat]

  const subBots = [
    ...new Set(
      global.conns
        .filter(v =>
          v?.user &&
          v?.ws?.socket &&
          v.ws.socket.readyState !== ws.CLOSED
        )
        .map(v => v.user.jid)
    )
  ]

  if (global.conn?.user?.jid) subBots.push(global.conn.user.jid)

  if (!m.mentionedJid?.[0] && !m.quoted?.sender) {
    const botActual = chat?.primaryBot

    return m.reply([
      `╔══〔 🌼 *THEELY-MD — BOT PRINCIPAL* 〕══╗`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ .settheely @subbot`,
      `║ O responde al mensaje del subbot~`,
      `║`,
      `║ 🤖 *SubBots activos:* ${subBots.length}`,
      botActual
        ? `║ ✅ *Actual:* @${botActual.split('@')[0]}`
        : `║ ⚠️ *Sin bot principal configurado*`,
      `║`,
      `║ 📋 *SubBots disponibles:*`,
      ...subBots.map(b => `║ 🌼 @${b.split('@')[0]}`),
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'), null, { mentions: subBots })
  }

  const who = m.mentionedJid?.[0] || m.quoted?.sender

  if (!subBots.includes(who)) {
    return conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — BOT PRINCIPAL* 〕══╗`,
        `║`,
        `║ ❌ *Usuario no reconocido~*`,
        `║ @${who.split('@')[0]} no pertenece`,
        `║ a la red de SubBots activos~`,
        `║`,
        `║ 🤖 *SubBots activos:* ${subBots.length}`,
        ...subBots.map(b => `║ 🌼 @${b.split('@')[0]}`),
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [who, ...subBots]
    }, { quoted: m })
  }

  if (chat.primaryBot === who) {
    return conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — BOT PRINCIPAL* 〕══╗`,
        `║`,
        `║ ⚠️ *Ya es el bot principal~*`,
        `║ @${who.split('@')[0]} ya está`,
        `║ configurado en este grupo~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [who]
    }, { quoted: m })
  }

  try {
    const anteriorBot = chat.primaryBot
    chat.primaryBot = who

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — BOT PRINCIPAL* 〕══╗`,
        `║`,
        `║ ✅ *¡Configuración actualizada!*`,
        `║`,
        `║ 🤖 *Nuevo bot principal:*`,
        `║ 👑 @${who.split('@')[0]}`,
        `║`,
        anteriorBot
          ? `║ 🔄 *Anterior:* @${anteriorBot.split('@')[0]}`
          : '',
        `║`,
        `║ 💡 A partir de ahora los`,
        `║ comandos serán atendidos`,
        `║ por este bot~`,
        `║`,
        `║ 💫 *Powered by TheEly-MD 🌼*`,
        `╚══════════════════════════════════╝`
      ].filter(Boolean).join('\n'),
      mentions: [who, anteriorBot].filter(Boolean)
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('❌ Error en settheely:', e.message)
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — ERROR* 〕══╗`,
      `║`,
      `║ ❌ *Error inesperado~*`,
      `║ ${e.message.slice(0, 100)}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help = ['setely @subbot']
handler.tags = ['jadibot']
handler.command = ['setely']
handler.group = true
handler.admin = true
handler.desc = '< Configura el bot principal del grupo'

export default handler
