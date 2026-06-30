import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const COLORES = ['🔴', '🔵', '🟢', '🟡']

function crearMensaje(chat, text, userId, m) {
  const rows = COLORES.map((c, i) => ({
    title: `${c} Color ${i + 1}`,
    id: `simon_${i}_${userId}`
  }))

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '🎵 SIGUIENTE COLOR',
      sections: [{ title: '🎨 Elige el color', rows }]
    })
  }]

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: {
            title: '🌼 THEELY-MD — SIMON DICE',
            subtitle: 'Repite la secuencia',
            hasMediaAttachment: false
          },
          body: { text },
          footer: { text: '🎮 Powered by TheEly-MD 🌼' },
          nativeFlowMessage: { buttons }
        })
      }
    }
  }, { quoted: m })
}

let handler = async (m, { conn }) => {
  global.simon = global.simon || {}

  if (global.simon[m.sender]) return m.reply([
    `╔══〔 🌼 *SIMON DICE* 〕══╗`,
    `║`,
    `║ ⚠️ Ya tienes un juego activo~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const secuencia = [Math.floor(Math.random() * 4)]

  global.simon[m.sender] = {
    secuencia,
    progreso: [],
    nivel: 1
  }

  await m.react('🎵')

  const secuenciaVisual = secuencia.map(i => COLORES[i]).join(' ')

  const text = [
    `╔══〔 🌼 *SIMON DICE* 〕══╗`,
    `║`,
    `║ 🎵 *Nivel 1*`,
    `║`,
    `║ Secuencia: ${secuenciaVisual}`,
    `║`,
    `║ 👇 *Elige el primer color~*`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const msg = crearMensaje(m.chat, text, m.sender, m)
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id
    if (!id?.startsWith('simon_')) return

    const [, colorIdx, userId] = id.split('_')
    const game = global.simon?.[userId]
    if (!game) {
      await conn.sendMessage(m.chat, {
        text: `╔══〔 🌼 *SIMON DICE* 〕══╗\n║\n║ ❌ No hay juego activo~\n║ 💡 Usa *.simondice* para empezar\n║\n╚══════════════════════════════════╝`
      }, { quoted: m })
      return true
    }

    const moneda = global.moneda || 'coins'
    const elegido = parseInt(colorIdx)
    game.progreso.push(elegido)

    const indiceActual = game.progreso.length - 1
    const correcto = game.progreso[indiceActual] === game.secuencia[indiceActual]

    if (!correcto) {
      const recompensa = Math.max(0, (game.nivel - 1) * 30)

      if (recompensa > 0) {
        if (!global.db.data.users[userId]) global.db.data.users[userId] = { coin: 0 }
        global.db.data.users[userId].coin = (global.db.data.users[userId].coin || 0) + recompensa
        await global.db.write()
      }

      const text = [
        `╔══〔 🌼 *SIMON DICE* 〕══╗`,
        `║`,
        `║ ❌ *¡Incorrecto!*`,
        `║ Llegaste al nivel ${game.nivel}`,
        `║`,
        recompensa > 0 ? `║ 💰 *+${recompensa}* ${moneda} de consuelo` : '',
        `║`,
        `╚══════════════════════════════════╝`
      ].filter(Boolean).join('\n')

      delete global.simon[userId]
      await conn.sendMessage(m.chat, { text }, { quoted: m })
      await m.react('❌')
      return true
    }

    if (game.progreso.length === game.secuencia.length) {
      // ── Completó el nivel actual ──
      if (game.nivel >= 8) {
        const recompensa = 30 * game.nivel

        if (!global.db.data.users[userId]) global.db.data.users[userId] = { coin: 0 }
        global.db.data.users[userId].coin = (global.db.data.users[userId].coin || 0) + recompensa
        await global.db.write()

        const text = [
          `╔══〔 🌼 *SIMON DICE* 〕══╗`,
          `║`,
          `║ 🏆 *¡PERFECTO!*`,
          `║ Completaste todos los niveles~`,
          `║`,
          `║ 💰 *+${recompensa}* ${moneda}`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')

        delete global.simon[userId]
        await conn.sendMessage(m.chat, { text }, { quoted: m })
        await m.react('🏆')
        return true
      }

      game.nivel++
      game.secuencia.push(Math.floor(Math.random() * 4))
      game.progreso = []

      const secuenciaVisual = game.secuencia.map(i => COLORES[i]).join(' ')

      const text = [
        `╔══〔 🌼 *SIMON DICE* 〕══╗`,
        `║`,
        `║ ✅ *¡Correcto! Nivel ${game.nivel}*`,
        `║`,
        `║ Secuencia: ${secuenciaVisual}`,
        `║`,
        `║ 👇 *Elige el primer color~*`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')

      await m.react('✅')
      const msg = crearMensaje(m.chat, text, userId, m)
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      return true
    }

    // ── Sigue dentro de la secuencia actual, falta más ──
    const text = [
      `╔══〔 🌼 *SIMON DICE* 〕══╗`,
      `║`,
      `║ ✅ *Correcto~* (${game.progreso.length}/${game.secuencia.length})`,
      `║`,
      `║ 👇 *Continúa la secuencia~*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    await m.react('✅')
    const msg = crearMensaje(m.chat, text, userId, m)
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return true

  } catch (e) {
    console.error('❌ Error en simon:', e.message)
  }
}

handler.command = ['simondice', 'simon']
handler.tags    = ['game']
handler.help    = ['simondice']
handler.desc    = 'Juega Simon Dice y gana ElyCoins'

export default handler
