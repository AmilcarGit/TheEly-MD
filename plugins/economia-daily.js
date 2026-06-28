const DAILY_REWARD_MIN = 100
const DAILY_REWARD_MAX = 500
const COOLDOWN = 24 * 60 * 60 * 1000

const handler = async (m, { conn }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const ahora  = Date.now()
  const ultimo = user.lastclaim || 0
  const espera = COOLDOWN - (ahora - ultimo)

  if (espera > 0) {
    const h   = Math.floor(espera / 3600000)
    const min = Math.floor((espera % 3600000) / 60000)
    const s   = Math.floor((espera % 60000) / 1000)
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — DAILY* 〕══╗`,
      `║`,
      `║ ⏳ *Ya reclamaste hoy~*`,
      `║`,
      `║ 🕐 *Tiempo restante:*`,
      `║ ${String(h).padStart(2,'0')}h ${String(min).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const recompensa = Math.floor(Math.random() * (DAILY_REWARD_MAX - DAILY_REWARD_MIN + 1)) + DAILY_REWARD_MIN

  user.coin      = (user.coin || 0) + recompensa
  user.lastclaim = ahora

  await m.react('💰')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — DAILY* 〕══╗`,
    `║`,
    `║ 🎁 *¡Recompensa diaria!*`,
    `║`,
    `║ 💰 *+${recompensa}* ${moneda}`,
    `║ 👛 *Total:* ${user.coin} ${moneda}`,
    `║ 🏦 *Banco:* ${user.bank || 0} ${moneda}`,
    `║`,
    `║ ⏰ Vuelve en 24 horas~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help     = ['daily']
handler.tags     = ['eco']
handler.command  = ['daily', 'recompensa', 'claim']
handler.register = true
handler.desc     = 'Reclama tu recompensa diaria'

export default handler
