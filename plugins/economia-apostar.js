const handler = async (m, { conn, args }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const apuesta = parseInt(args[0])

  if (!apuesta || apuesta <= 0) return m.reply([
    `╔══〔 🌼 *THEELY-MD — APOSTAR* 〕══╗`,
    `║`,
    `║ 🎯 *Uso:* .apostar <monto>`,
    `║ 📌 Ejemplo: .apostar 200`,
    `║`,
    `║ 💡 50% ganar x2 | 50% perder`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if ((user.coin || 0) < apuesta) return m.reply([
    `╔══〔 🌼 *THEELY-MD — APOSTAR* 〕══╗`,
    `║`,
    `║ ❌ *Saldo insuficiente~*`,
    `║ 👛 Tienes: ${user.coin || 0} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const gano = Math.random() < 0.5
  let resultado, emoji

  if (gano) {
    user.coin += apuesta
    resultado  = `🎉 *¡Ganaste!*\n║ 💰 *+${apuesta}* ${moneda}`
    emoji      = '🎉'
  } else {
    user.coin -= apuesta
    resultado  = `💸 *¡Perdiste!*\n║ 💸 *-${apuesta}* ${moneda}`
    emoji      = '😢'
  }

  await m.react(emoji)
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — APOSTAR* 〕══╗`,
    `║`,
    `║ 🎯 *Apuesta:* ${apuesta} ${moneda}`,
    `║`,
    `║ ${resultado}`,
    `║ 👛 *Saldo:* ${user.coin} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help     = ['apostar <monto>']
handler.tags     = ['eco']
handler.command  = ['apostar', 'bet', 'jugar']
handler.register = true
handler.desc     = 'Apuesta monedas al 50/50'
export default handler
