const handler = async (m, { conn, usedPrefix, command }) => {
  const quien = m.mentionedJid?.[0] || m.quoted?.sender

  if (!quien) return m.reply([
    `╔══〔 🌼 *THEELY-MD — GETINFO* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} @usuario`,
    `║ O responde a un mensaje~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  await m.react('🔍')

  try {
    const [resultado] = await conn.onWhatsApp(quien.split('@')[0])

    if (!resultado?.exists) return m.reply([
      `╔══〔 🌼 *THEELY-MD — GETINFO* 〕══╗`,
      `║`,
      `║ ❌ Número no registrado en WhatsApp~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    const numero = quien.split('@')[0].split(':')[0]
    const jid    = resultado.jid || quien
    const user   = global.db.data.users[quien] || global.db.data.users[jid] || {}

    let pp = null
    try { pp = await conn.profilePictureUrl(quien, 'image') } catch {}

    const nombre   = user.name || m.pushName || 'Desconocido'
    const premium  = user.premium ? '✅ Sí' : '❌ No'
    const banned   = user.banned ? '🔴 Sí' : '🟢 No'
    const nivel    = user.level || 0
    const coins    = user.coin || 0
    const moneda   = global.moneda || 'coins'

    const texto = [
      `╔══〔 🌼 *THEELY-MD — GETINFO* 〕══╗`,
      `║`,
      `║ 👤 *Nombre:*   ${nombre}`,
      `║ 📱 *Número:*   +${numero}`,
      `║ 🆔 *JID:*      ${jid}`,
      `║`,
      `╠══〔 📊 *EN EL BOT* 〕══════════════╣`,
      `║`,
      `║ ⭐ *Nivel:*    ${nivel}`,
      `║ 💰 *Coins:*    ${coins} ${moneda}`,
      `║ 👑 *Premium:*  ${premium}`,
      `║ 🚫 *Baneado:*  ${banned}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    if (pp) {
      await conn.sendMessage(m.chat, { image: { url: pp }, caption: texto, mentions: [quien] }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { text: texto, mentions: [quien] }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply(`❌ Error al obtener info: ${e.message.slice(0, 80)}`)
  }
}

handler.help    = ['getinfo @usuario']
handler.tags    = ['tools']
handler.command = ['getinfo', 'infouser', 'userinfo']
handler.desc    = 'Obtiene info de un usuario de WhatsApp'
export default handler
