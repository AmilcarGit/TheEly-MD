const COLORES = ['🔴', '🔵', '🟢', '🟡']
const sesiones = {}
const RECOMPENSA_BASE = 30

const handler = async (m, { conn }) => {
  if (sesiones[m.chat]) return m.reply([
    `╔══〔 🌼 *THEELY-MD — SIMON DICE* 〕══╗`,
    `║`,
    `║ ⚠️ Ya hay un juego activo~`,
    `║ Usa *.repetir <secuencia>*`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const secuencia = [COLORES[Math.floor(Math.random() * 4)]]

  sesiones[m.chat] = {
    secuencia,
    nivel: 1,
    jugador: m.sender,
    tiempo: setTimeout(() => {
      if (sesiones[m.chat]) {
        conn.sendMessage(m.chat, { text: `⏰ Simon Dice cancelado por inactividad~` })
        delete sesiones[m.chat]
      }
    }, 60000)
  }

  await m.react('🎵')
  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — SIMON DICE* 〕══╗`,
      `║`,
      `║ 🎵 *¡Memoriza la secuencia!*`,
      `║`,
      `║ ${secuencia.join(' ')}`,
      `║`,
      `║ ⏰ Tienes 15 segundos~`,
      `║ 💡 Responde con *.repetir* y los`,
      `║ emojis en orden (separados por`,
      `║ espacio)`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  setTimeout(async () => {
    if (sesiones[m.chat] && sesiones[m.chat].nivel === 1) {
      await conn.sendMessage(m.chat, {
        text: `╔══〔 🌼 *THEELY-MD* 〕══╗\n║\n║ 👀 *¡Secuencia oculta!*\n║ Responde ahora~\n║\n╚══════════════════════╝`
      })
    }
  }, 5000)
}

handler.before = async (m, { conn, command, text }) => {
  if (command !== 'repetir' || !sesiones[m.chat]) return false

  const sesion = sesiones[m.chat]
  const moneda = global.moneda || 'coins'

  if (m.sender !== sesion.jugador) {
    await m.reply(`⚠️ No es tu juego, espera tu turno~`)
    return true
  }

  const respuesta = text.trim().split(' ').filter(Boolean)
  const correcta  = JSON.stringify(respuesta) === JSON.stringify(sesion.secuencia)

  if (correcta) {
    clearTimeout(sesion.tiempo)
    sesion.nivel++
    sesion.secuencia.push(COLORES[Math.floor(Math.random() * 4)])

    if (sesion.nivel > 8) {
      // ── GANÓ EL JUEGO COMPLETO ──
      const recompensa = RECOMPENSA_BASE * sesion.nivel
      if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { coin: 0 }
      global.db.data.users[m.sender].coin = (global.db.data.users[m.sender].coin || 0) + recompensa
      await global.db.write()

      await m.react('🏆')
      await conn.sendMessage(m.chat, {
        text: [
          `╔══〔 🌼 *THEELY-MD — SIMON DICE* 〕══╗`,
          `║`,
          `║ 🏆 *¡PERFECTO! Completaste*`,
          `║ *todos los niveles!*`,
          `║`,
          `║ 💰 *+${recompensa}* ${moneda}`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })

      delete sesiones[m.chat]
      return true
    }

    sesion.tiempo = setTimeout(() => {
      if (sesiones[m.chat]) {
        conn.sendMessage(m.chat, { text: `⏰ Simon Dice cancelado por inactividad~` })
        delete sesiones[m.chat]
      }
    }, 60000)

    await m.react('✅')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — SIMON DICE* 〕══╗`,
        `║`,
        `║ ✅ *¡Correcto! Nivel ${sesion.nivel}*`,
        `║`,
        `║ ${sesion.secuencia.join(' ')}`,
        `║`,
        `║ ⏰ 15 segundos para memorizar~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

  } else {
    clearTimeout(sesion.tiempo)
    const recompensa = RECOMPENSA_BASE * (sesion.nivel - 1)

    if (recompensa > 0) {
      if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { coin: 0 }
      global.db.data.users[m.sender].coin = (global.db.data.users[m.sender].coin || 0) + recompensa
      await global.db.write()
    }

    await m.react('❌')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — SIMON DICE* 〕══╗`,
        `║`,
        `║ ❌ *¡Incorrecto!*`,
        `║ Llegaste al nivel ${sesion.nivel}`,
        `║`,
        recompensa > 0 ? `║ 💰 *+${recompensa}* ${moneda} de consuelo` : '',
        `║`,
        `╚══════════════════════════════════╝`
      ].filter(Boolean).join('\n')
    }, { quoted: m })

    delete sesiones[m.chat]
  }

  return true
}

handler.help    = ['simondice', 'repetir <secuencia>']
handler.tags    = ['game']
handler.command = ['simondice', 'simon', 'repetir']
handler.register = true
handler.desc    = 'Juega Simon Dice y gana ElyCoins'

export default handler
