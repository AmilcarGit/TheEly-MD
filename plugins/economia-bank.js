const handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const accion = (args[0] || '').toLowerCase()
  const monto  = parseInt(args[1])

  if (!accion || !['depositar', 'retirar', 'saldo', 'dep', 'ret', 'bal'].includes(accion)) {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — BANCO* 〕══╗`,
      `║`,
      `║ 🏦 *Comandos del banco:*`,
      `║`,
      `║ 💰 *Saldo:*`,
      `║ ${usedPrefix}bank saldo`,
      `║`,
      `║ 📥 *Depositar:*`,
      `║ ${usedPrefix}bank depositar <monto>`,
      `║`,
      `║ 📤 *Retirar:*`,
      `║ ${usedPrefix}bank retirar <monto>`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  // ── SALDO ──
  if (['saldo', 'bal'].includes(accion)) {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — BANCO* 〕══╗`,
      `║`,
      `║ 🏦 *Tu estado financiero~*`,
      `║`,
      `║ 👛 *Billetera:* ${user.coin || 0} ${moneda}`,
      `║ 🏦 *Banco:*     ${user.bank || 0} ${moneda}`,
      `║ 💎 *Total:*     ${(user.coin || 0) + (user.bank || 0)} ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  if (isNaN(monto) || monto <= 0) return m.reply([
    `╔══〔 🌼 *THEELY-MD — BANCO* 〕══╗`,
    `║`,
    `║ ❌ *Monto inválido~*`,
    `║ Ingresa un número mayor a 0`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  // ── DEPOSITAR ──
  if (['depositar', 'dep'].includes(accion)) {
    if ((user.coin || 0) < monto) return m.reply([
      `╔══〔 🌼 *THEELY-MD — BANCO* 〕══╗`,
      `║`,
      `║ ❌ *Saldo insuficiente~*`,
      `║ 👛 Tienes: ${user.coin || 0} ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    user.coin -= monto
    user.bank  = (user.bank || 0) + monto

    await m.react('📥')
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — BANCO* 〕══╗`,
      `║`,
      `║ 📥 *¡Depósito exitoso!*`,
      `║`,
      `║ 💰 *Depositado:* ${monto} ${moneda}`,
      `║ 👛 *Billetera:*  ${user.coin} ${moneda}`,
      `║ 🏦 *Banco:*      ${user.bank} ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  // ── RETIRAR ──
  if (['retirar', 'ret'].includes(accion)) {
    if ((user.bank || 0) < monto) return m.reply([
      `╔══〔 🌼 *THEELY-MD — BANCO* 〕══╗`,
      `║`,
      `║ ❌ *Saldo bancario insuficiente~*`,
      `║ 🏦 Tienes: ${user.bank || 0} ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    user.bank -= monto
    user.coin  = (user.coin || 0) + monto

    await m.react('📤')
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — BANCO* 〕══╗`,
      `║`,
      `║ 📤 *¡Retiro exitoso!*`,
      `║`,
      `║ 💰 *Retirado:*  ${monto} ${moneda}`,
      `║ 👛 *Billetera:* ${user.coin} ${moneda}`,
      `║ 🏦 *Banco:*     ${user.bank} ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help     = ['bank <acción> [monto]']
handler.tags     = ['eco']
handler.command  = ['bank', 'banco']
handler.register = true
handler.desc     = 'Gestiona tu banco personal'

export default handler
