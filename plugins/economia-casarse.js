const PRECIO_BODA   = 1000
const PRECIO_DIVORCIO = 500

const handler = async (m, { conn, args, usedPrefix }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const accion = (args[0] || '').toLowerCase()
  const quien  = m.mentionedJid?.[0] || m.quoted?.sender

  if (!accion) return m.reply([
    `╔══〔 🌼 *THEELY-MD — MATRIMONIO* 〕══╗`,
    `║`,
    `║ 💍 *Comandos:*`,
    `║`,
    `║ ${usedPrefix}casarse proponer @usuario`,
    `║ ${usedPrefix}casarse aceptar`,
    `║ ${usedPrefix}casarse rechazar`,
    `║ ${usedPrefix}casarse divorciar`,
    `║ ${usedPrefix}casarse ver`,
    `║`,
    `║ 💰 *Boda:*     ${PRECIO_BODA} ${moneda}`,
    `║ 💔 *Divorcio:* ${PRECIO_DIVORCIO} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  // ── VER ──
  if (accion === 'ver') {
    if (!user.marry) return m.reply([
      `╔══〔 🌼 *THEELY-MD — MATRIMONIO* 〕══╗`,
      `║`,
      `║ 💔 *No estás casado/a~*`,
      `║ Usa *.casarse proponer @usuario*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    const pareja = global.db.data.users[user.marry]
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — MATRIMONIO* 〕══╗`,
      `║`,
      `║ 💍 *¡Estás casado/a!*`,
      `║`,
      `║ 💑 *Pareja:* @${user.marry.split('@')[0]}`,
      `║ 👤 *Nombre:* ${pareja?.name || 'Desconocido'}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'), null, { mentions: [user.marry] })
  }

  // ── PROPONER ──
  if (accion === 'proponer') {
    if (!quien) return m.reply(`❌ Menciona a quien quieres proponer~`)
    if (quien === m.sender) return m.reply(`❌ No puedes casarte contigo mismo~`)

    if (user.marry) return m.reply([
      `╔══〔 🌼 *THEELY-MD — MATRIMONIO* 〕══╗`,
      `║`,
      `║ ❌ *Ya estás casado/a~*`,
      `║ Usa *.casarse divorciar* primero`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    const destino = global.db.data.users[quien]
    if (!destino) return m.reply(`❌ Ese usuario no está registrado~`)
    if (destino.marry) return m.reply(`❌ @${quien.split('@')[0]} ya está casado/a~`)

    if ((user.coin || 0) < PRECIO_BODA) return m.reply([
      `╔══〔 🌼 *THEELY-MD — MATRIMONIO* 〕══╗`,
      `║`,
      `║ ❌ *Saldo insuficiente~*`,
      `║ 💰 Necesitas: ${PRECIO_BODA} ${moneda}`,
      `║ 👛 Tienes: ${user.coin || 0} ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    global.db.data.users[m.sender].propuesta = quien
    global.db.data.users[quien].propuestaDE   = m.sender

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 💍 *THEELY-MD — PROPUESTA* 〕══╗`,
        `║`,
        `║ 💍 *¡Propuesta de matrimonio!*`,
        `║`,
        `║ 👤 @${m.sender.split('@')[0]} te propone`,
        `║ matrimonio a @${quien.split('@')[0]}~`,
        `║`,
        `║ 💰 *Costo:* ${PRECIO_BODA} ${moneda}`,
        `║`,
        `║ ✅ *.casarse aceptar*`,
        `║ ❌ *.casarse rechazar*`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [m.sender, quien]
    }, { quoted: m })

    await m.react('💍')
    return
  }

  // ── ACEPTAR ──
  if (accion === 'aceptar') {
    const propDeQuien = user.propuestaDE
    if (!propDeQuien) return m.reply(`❌ No tienes propuestas pendientes~`)

    const novio = global.db.data.users[propDeQuien]
    if (!novio) return m.reply(`❌ El usuario ya no existe~`)

    if ((novio.coin || 0) < PRECIO_BODA) return m.reply([
      `╔══〔 🌼 *THEELY-MD — MATRIMONIO* 〕══╗`,
      `║`,
      `║ ❌ Tu pareja no tiene suficientes`,
      `║ monedas para la boda~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    novio.coin -= PRECIO_BODA
    novio.marry  = m.sender
    user.marry   = propDeQuien
    delete novio.propuesta
    delete user.propuestaDE

    await m.react('💒')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 💒 *THEELY-MD — BODA* 〕══╗`,
        `║`,
        `║ 🎊 *¡Felicidades a los novios!*`,
        `║`,
        `║ 💑 @${propDeQuien.split('@')[0]}`,
        `║ 💑 @${m.sender.split('@')[0]}`,
        `║`,
        `║ 💍 *¡Ahora están casados!*`,
        `║ 💰 *-${PRECIO_BODA}* ${moneda}`,
        `║`,
        `║ 🌼 *¡Que sean muy felices!*`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [propDeQuien, m.sender]
    }, { quoted: m })
    return
  }

  // ── RECHAZAR ──
  if (accion === 'rechazar') {
    const propDeQuien = user.propuestaDE
    if (!propDeQuien) return m.reply(`❌ No tienes propuestas pendientes~`)

    delete global.db.data.users[propDeQuien].propuesta
    delete user.propuestaDE

    await m.react('💔')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 💔 *THEELY-MD — MATRIMONIO* 〕══╗`,
        `║`,
        `║ 💔 *Propuesta rechazada~*`,
        `║`,
        `║ @${propDeQuien.split('@')[0]} fue rechazado/a`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [propDeQuien]
    }, { quoted: m })
    return
  }

  // ── DIVORCIAR ──
  if (accion === 'divorciar') {
    if (!user.marry) return m.reply([
      `╔══〔 🌼 *THEELY-MD — MATRIMONIO* 〕══╗`,
      `║`,
      `║ ❌ *No estás casado/a~*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    if ((user.coin || 0) < PRECIO_DIVORCIO) return m.reply([
      `╔══〔 🌼 *THEELY-MD — MATRIMONIO* 〕══╗`,
      `║`,
      `║ ❌ *Saldo insuficiente~*`,
      `║ 💰 Divorcio: ${PRECIO_DIVORCIO} ${moneda}`,
      `║ 👛 Tienes: ${user.coin || 0} ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    const exPareja = user.marry
    const exUser   = global.db.data.users[exPareja]

    user.coin -= PRECIO_DIVORCIO
    delete user.marry
    if (exUser) delete exUser.marry

    await m.react('💔')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 💔 *THEELY-MD — DIVORCIO* 〕══╗`,
        `║`,
        `║ 💔 *Divorcio completado~*`,
        `║`,
        `║ 💰 *-${PRECIO_DIVORCIO}* ${moneda}`,
        `║ 👛 *Saldo:* ${user.coin} ${moneda}`,
        `║`,
        `║ @${exPareja.split('@')[0]} y tú ya`,
        `║ no están casados~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [exPareja]
    }, { quoted: m })
    return
  }
}

handler.help     = ['casarse <acción>']
handler.tags     = ['eco']
handler.command  = ['casarse', 'marry', 'boda']
handler.register = true
handler.desc     = 'Sistema de matrimonio entre usuarios'
export default handler
