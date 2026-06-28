const handler = async (m, { conn, args }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const quien  = m.mentionedJid?.[0] || m.quoted?.sender
  const monto  = parseInt(args[args.length - 1])

  if (!quien || !monto || monto <= 0) return m.reply([
    `╔══〔 🌼 *THEELY-MD — TRANSFERIR* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ .transferir @usuario <monto>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ .transferir @Ely 500`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (quien === m.sender) return m.reply([
    `╔══〔 🌼 *THEELY-MD — TRANSFERIR* 〕══╗`,
    `║`,
    `║ ❌ No puedes transferirte`,
    `║ monedas a ti mismo~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if ((user.coin || 0) < monto) return m.reply([
    `╔══〔 🌼 *THEELY-MD — TRANSFERIR* 〕══╗`,
    `║`,
    `║ ❌ *Saldo insuficiente~*`,
    `║ 👛 Tienes: ${user.coin || 0} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const destino = global.db.data.users[quien]
  if (!destino) return m.reply(`❌ Ese usuario no está registrado~`)

  user.coin    -= monto
  destino.coin  = (destino.coin || 0) + monto

  await m.react('💸')
  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — TRANSFERIR* 〕══╗`,
      `║`,
      `║ 💸 *¡Transferencia exitosa!*`,
      `║`,
      `║ 📤 *De:*    @${m.sender.split('@')[0]}`,
      `║ 📥 *Para:*  @${quien.split('@')[0]}`,
      `║ 💰 *Monto:* ${monto} ${moneda}`,
      `║`,
      `║ 👛 *Tu saldo:* ${user.coin} ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'),
    mentions: [m.sender, quien]
  }, { quoted: m })
}

handler.help     = ['transferir @usuario <monto>']
handler.tags     = ['eco']
handler.command  = ['transferir', 'enviar', 'pay']
handler.register = true
handler.desc     = 'Transfiere monedas a otro usuario'
export default handler
