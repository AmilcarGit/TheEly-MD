import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

function crearMensaje(chat, text, chatId, m, participantes) {
  const rows = [
    { title: '🔫 ¡Disparar!', id: `ruleta_disparar_${chatId}` },
    { title: '🚪 Salir de la ruleta', id: `ruleta_salir_${chatId}` }
  ]

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '🔫 RULETA RUSA',
      sections: [{ title: '🎮 Opciones', rows }]
    })
  }]

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: { title: '🌼 THEELY-MD — RULETA RUSA', subtitle: 'Modo grupal', hasMediaAttachment: false },
          body: { text },
          footer: { text: '🎮 Powered by TheEly-MD 🌼' },
          nativeFlowMessage: { buttons }
        })
      }
    }
  }, { quoted: m })
}

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply([
    `╔══〔 🌼 *RULETA RUSA* 〕══╗`,
    `║`,
    `║ ❌ Solo funciona en grupos~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  global.ruleta = global.ruleta || {}

  if (global.ruleta[m.chat]) return m.reply([
    `╔══〔 🌼 *RULETA RUSA* 〕══╗`,
    `║`,
    `║ ⚠️ Ya hay una ruleta activa~`,
    `║ Únete tocando *¡Disparar!*`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const balaPos = Math.floor(Math.random() * 6)

  global.ruleta[m.chat] = {
    bala: balaPos,
    disparo: 0,
    jugadores: [m.sender],
    iniciador: m.sender
  }

  await m.react('🔫')

  const text = [
    `╔══〔 🌼 *RULETA RUSA* 〕══╗`,
    `║`,
    `║ 🔫 *¡Nueva partida iniciada!*`,
    `║`,
    `║ 👤 @${m.sender.split('@')[0]} empezó`,
    `║`,
    `║ 🎯 *Tambor:* 6 balas (1 real)`,
    `║ 👥 *Jugadores:* 1`,
    `║`,
    `║ 👇 *Toca disparar para jugar~*`,
    `║ ⚠️ Cualquiera puede unirse~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const msg = crearMensaje(m.chat, text, m.chat, m, [m.sender])
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id, mentions: [m.sender] })
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id
    if (!id?.startsWith('ruleta_')) return

    const partes = id.split('_')
    const accion = partes[1]
    const chatId = partes[2]

    const game = global.ruleta?.[chatId]
    if (!game) {
      await conn.sendMessage(m.chat, { text: `❌ No hay ruleta activa~ Usa *.ruletarusa*` }, { quoted: m })
      return true
    }

    const moneda = global.moneda || 'coins'

    if (accion === 'salir') {
      await conn.sendMessage(m.chat, {
        text: `🚪 @${m.sender.split('@')[0]} salió de la ruleta~ Cobarde 😏`,
        mentions: [m.sender]
      }, { quoted: m })
      return true
    }

    if (accion === 'disparar') {
      if (!game.jugadores.includes(m.sender)) game.jugadores.push(m.sender)

      const esBala = game.disparo === game.bala
      game.disparo++

      if (esBala) {
        // ── PERDIÓ — recibe "penalización" simbólica ──
        const multa = Math.floor(Math.random() * 100) + 50

        if (global.db.data.users[m.sender]) {
          global.db.data.users[m.sender].coin = Math.max(0, (global.db.data.users[m.sender].coin || 0) - multa)
          await global.db.write()
        }

        const text = [
          `╔══〔 🌼 *RULETA RUSA* 〕══╗`,
          `║`,
          `║ 💥 *¡BANG!*`,
          `║`,
          `║ 💀 @${m.sender.split('@')[0]} recibió el disparo`,
          `║`,
          `║ 💸 *Multa:* -${multa} ${moneda}`,
          `║ 🎯 *Disparos totales:* ${game.disparo}`,
          `║`,
          `║ 🔄 *¡Partida terminada!*`,
          `║ Usa *.ruletarusa* para jugar de nuevo`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')

        delete global.ruleta[chatId]
        await conn.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
        await m.react('💥')
        return true
      }

      // ── Sobrevivió ──
      const recompensa = Math.floor(Math.random() * 50) + 20

      if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { coin: 0 }
      global.db.data.users[m.sender].coin = (global.db.data.users[m.sender].coin || 0) + recompensa
      await global.db.write()

      const balasRestantes = 6 - game.disparo

      const text = [
        `╔══〔 🌼 *RULETA RUSA* 〕══╗`,
        `║`,
        `║ 🔫 *¡Click!* Sobreviviste~`,
        `║`,
        `║ 👤 @${m.sender.split('@')[0]}`,
        `║ 💰 *+${recompensa}* ${moneda} de adrenalina`,
        `║`,
        `║ 🎯 *Balas restantes:* ${balasRestantes}`,
        `║ 👥 *Jugadores:* ${game.jugadores.length}`,
        `║`,
        `║ 👇 *¿Quién se atreve a seguir?*`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')

      await m.react('😅')
      const msg = crearMensaje(m.chat, text, chatId, m, game.jugadores)
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id, mentions: game.jugadores })
      return true
    }

  } catch (e) {
    console.error('❌ Error en ruleta:', e.message)
  }
}

handler.command = ['ruletarusa', 'ruleta']
handler.tags    = ['multijugador']
handler.help    = ['ruletarusa']
handler.group   = true
handler.register = true
handler.desc    = 'Ruleta rusa grupal — sobrevive y gana ElyCoins'

export default handler
