const handler = async (m, { conn, args, usedPrefix, command }) => {
  const moneda = global.moneda || 'coins'
  const quien  = m.mentionedJid?.[0] || m.quoted?.sender
  const monto  = parseInt(args[args.length - 1])

  if (!quien || isNaN(monto)) return m.reply([
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

  // ── Normalizar JID (fix multi-device) ──
  const normalizarJid = (jid) => {
    if (!jid) return jid
    return jid.includes(':')
      ? jid.split(':')[0] + '@s.whatsapp.net'
      : jid
  }

  const jidNormal = normalizarJid(quien)

  // ── Buscar usuario con JID normalizado o con el original ──
  const jidReal = global.db.data.users[jidNormal]
    ? jidNormal
    : global.db.data.users[quien]
      ? quien
      : jidNormal

  // ── Inicializar usuario si no existe ──
  if (!global.db.data.users[jidReal]) {
    global.db.data.users[jidReal] = {
      exp: 0, coin: 0, bank: 0, level: 0,
      registered: false, premium: false,
      warn: 0, diamond: 0
    }
  }

  const antesCoins = global.db.data.users[jidReal].coin || 0

  if (monto === 0) {
    global.db.data.users[jidReal].coin = 0
  } else {
    global.db.data.users[jidReal].coin = Math.max(0, antesCoins + monto)
  }

  const ahoraCoins = global.db.data.users[jidReal].coin

  await global.db.write()

  const accion = monto === 0 ? '🔄 *Reseteadas*' : monto > 0 ? '➕ *Añadidas*' : '➖ *Quitadas*'
  const emoji  = monto === 0 ? '🔄' : monto > 0 ? '💰' : '💸'

  await m.react(emoji)
  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — DAR MONEDAS* 〕══╗`,
      `║`,
      `║ ${accion}`,
      `║`,
      `║ 👤 @${jidReal.split('@')[0].split(':')[0]}`,
      `║ 🔑 *JID:* ${jidReal}`,
      `║ 💰 *Cantidad:* ${monto > 0 ? '+' : ''}${monto} ${moneda}`,
      `║ 📊 *Antes:*    ${antesCoins} ${moneda}`,
      `║ 📊 *Ahora:*    ${ahoraCoins} ${moneda}`,
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
