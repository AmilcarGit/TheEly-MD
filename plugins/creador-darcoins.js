const handler = async (m, { conn, args, usedPrefix, command }) => {
  const moneda = global.moneda || 'coins'
  const quien  = m.mentionedJid?.[0] || m.quoted?.sender
  const monto  = parseInt(args[args.length - 1])

  if (!quien || !monto) return m.reply([
    `╔══〔 🌼 *THEELY-MD — DAR MONEDAS* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} @usuario <monto>`,
    `║`,
    `║ 📌 *Ejemplos:*`,
    `║ ${usedPrefix + command} @Ely 5000`,
    `║ ${usedPrefix + command} @Ely -1000 (quitar)`,
    `║ ${usedPrefix + command} @Ely 0 (resetear)`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const destino = global.db.data.users[quien]
  if (!destino) return m.reply([
    `╔══〔 🌼 *THEELY-MD — DAR MONEDAS* 〕══╗`,
    `║`,
    `║ ❌ *Usuario no encontrado~*`,
    `║ Ese usuario no está registrado`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const antesCoins = destino.coin || 0

  if (monto === 0) {
    destino.coin = 0
    global.markDatabaseModified?.()
    await global.db.write?.()
    await m.react('🔄')
    return conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — DAR MONEDAS* 〕══╗`,
        `║`,
        `║ 🔄 *Monedas reseteadas~*`,
        `║`,
        `║ 👤 @${quien.split('@')[0]}`,
        `║ 💰 *Antes:* ${antesCoins} ${moneda}`,
        `║ 💰 *Ahora:* 0 ${moneda}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [quien]
    }, { quoted: m })
  }

  destino.coin = Math.max(0, antesCoins + monto)
  global.markDatabaseModified?.()
  await global.db.write?.()

  const accion = monto > 0 ? '➕ *Añadidas*' : '➖ *Quitadas*'
  const emoji  = monto > 0 ? '💰' : '💸'

  await m.react(emoji)
  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — DAR MONEDAS* 〕══╗`,
      `║`,
      `║ ${accion}`,
      `║`,
      `║ 👤 @${quien.split('@')[0]}`,
      `║ 💰 *Cantidad:* ${monto > 0 ? '+' : ''}${monto} ${moneda}`,
      `║ 📊 *Antes:*    ${antesCoins} ${moneda}`,
      `║ 📊 *Ahora:*    ${destino.coin} ${moneda}`,
      `║`,
      `║ 👑 *Acción del Owner~*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'),
    mentions: [quien]
  }, { quoted: m })
}

handler.help     = ['darcoins @usuario <monto>']
handler.tags     = ['creador']
handler.command  = ['darcoins', 'addcoins', 'setcoins', 'givecoins']
handler.rowner   = true
handler.desc     = 'Da, quita o resetea monedas a un usuario'
export default handler
