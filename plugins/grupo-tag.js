import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, participants, isAdmin, isOwner }) => {
  if (!text && !m.quoted) {
    return conn.reply(
      m.chat,
      '🌼 Debes escribir un mensaje para activar el hidetag ultra TheEly-MD.',
      m
    )
  }

  const mensaje = m.quoted?.text || text || '✨ TheEly-MD te menciona'
  const users = participants.map(u => conn.decodeJid(u.id))
  const total = users.length

  if (total === 0) return conn.reply(m.chat, '⚠️ No se encontraron usuarios para mencionar.', m)

  await conn.reply(
    m.chat,
    `╔══〔 🌼 THEELY-MD 〕══╗\n║ 📢 Iniciando notificación global...\n║ 🎯 Usuarios detectados: ${total}\n╚══════════════════════╝`,
    m
  )

  let enviados = 0

  for (let i = 0; i < users.length; i += 10) {
    const lote = users.slice(i, i + 10)

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        extendedTextMessage: {
          text: `╔══〔 🌼 THEELY-MD 〕══╗\n║ 📢 Notificación oficial\n╚══════════════════════╝\n\n${mensaje}`,
          contextInfo: { mentionedJid: lote }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    enviados += lote.length

    const progress = Math.round((enviados / total) * 20)
    const barra = '▓'.repeat(progress) + '░'.repeat(20 - progress)
    await conn.sendMessage(
      m.chat,
      { text: `⌛ Enviando... [${barra}] ${enviados}/${total} usuarios notificados` },
      { quoted: m }
    )

    await new Promise(res => setTimeout(res, 700))
  }

  await conn.reply(
    m.chat,
    `╔══〔 🌼 THEELY-MD 〕══╗\n║ ✅ Notificación completada\n║ 📨 Total notificados: ${enviados}\n║ ✨ Proceso finalizado con éxito\n╚══════════════════════╝`,
    m
  )
}

handler.help = ['tag']
handler.tags = ['grupo']
handler.command = ['tag', 'tagultra']
handler.group = true
handler.admin = true

export default handler
