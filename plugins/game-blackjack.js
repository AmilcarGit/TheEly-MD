import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const PALOS = ['♠️','♥️','♦️','♣️']
const VALORES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

function nuevaCarta() {
  const palo = PALOS[Math.floor(Math.random() * 4)]
  const valor = VALORES[Math.floor(Math.random() * 13)]
  return { valor, palo }
}

function valorCarta(carta) {
  if (carta.valor === 'A') return 11
  if (['J','Q','K'].includes(carta.valor)) return 10
  return parseInt(carta.valor)
}

function calcularTotal(mano) {
  let total = mano.reduce((acc, c) => acc + valorCarta(c), 0)
  let ases = mano.filter(c => c.valor === 'A').length
  while (total > 21 && ases > 0) { total -= 10; ases-- }
  return total
}

function manoVisual(mano) {
  return mano.map(c => `${c.valor}${c.palo}`).join(' ')
}

function crearMensaje(chat, text, userId, m) {
  const rows = [
    { title: '🃏 Pedir carta', id: `bj_hit_${userId}` },
    { title: '✋ Plantarse', id: `bj_stand_${userId}` }
  ]

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '🎲 ELIGE TU JUGADA',
      sections: [{ title: '🎮 Opciones', rows }]
    })
  }]

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: { title: '🌼 THEELY-MD — BLACKJACK', subtitle: 'Vs el Bot', hasMediaAttachment: false },
          body: { text },
          footer: { text: '🎮 Powered by TheEly-MD 🌼' },
          nativeFlowMessage: { buttons }
        })
      }
    }
  }, { quoted: m })
}

let handler = async (m, { conn, args }) => {
  global.blackjack = global.blackjack || {}

  if (global.blackjack[m.sender]) return m.reply([
    `╔══〔 🌼 *BLACKJACK* 〕══╗`,
    `║`,
    `║ ⚠️ Ya tienes una partida activa~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const apuesta = parseInt(args[0]) || 0
  const user = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'

  if (apuesta > 0 && (user.coin || 0) < apuesta) return m.reply([
    `╔══〔 🌼 *BLACKJACK* 〕══╗`,
    `║`,
    `║ ❌ *Saldo insuficiente~*`,
    `║ 👛 Tienes: ${user.coin || 0} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (apuesta > 0) {
    global.db.data.users[m.sender].coin -= apuesta
    await global.db.write()
  }

  const jugador = [nuevaCarta(), nuevaCarta()]
  const bot     = [nuevaCarta(), nuevaCarta()]

  global.blackjack[m.sender] = { jugador, bot, apuesta, terminado: false }

  await m.react('🃏')

  const totalJugador = calcularTotal(jugador)

  const text = [
    `╔══〔 🌼 *BLACKJACK* 〕══╗`,
    `║`,
    `║ 🎴 *Tu mano:* ${manoVisual(jugador)}`,
    `║ 🔢 *Total:* ${totalJugador}`,
    `║`,
    `║ 🤖 *Bot:* ${bot[0].valor}${bot[0].palo} 🔲`,
    `║`,
    apuesta > 0 ? `║ 💰 *Apuesta:* ${apuesta} ${moneda}` : `║ 🎲 *Modo:* Sin apuesta`,
    `║`,
    `║ 👇 *¿Pides carta o te plantas?*`,
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
    if (!id?.startsWith('bj_')) return

    const partes = id.split('_')
    const accion = partes[1]
    const userId = partes[2]

    const game = global.blackjack?.[userId]
    if (!game) {
      await conn.sendMessage(m.chat, { text: `❌ No hay partida activa~ Usa *.blackjack*` }, { quoted: m })
      return true
    }

    const moneda = global.moneda || 'coins'

    if (accion === 'hit') {
      game.jugador.push(nuevaCarta())
      const total = calcularTotal(game.jugador)

      if (total > 21) {
        const text = [
          `╔══〔 🌼 *BLACKJACK* 〕══╗`,
          `║`,
          `║ 🎴 *Tu mano:* ${manoVisual(game.jugador)}`,
          `║ 🔢 *Total:* ${total}`,
          `║`,
          `║ 💥 *¡Te pasaste de 21!*`,
          `║ 😢 *Perdiste~*`,
          game.apuesta > 0 ? `║ 💸 *-${game.apuesta}* ${moneda}` : '',
          `║`,
          `╚══════════════════════════════════╝`
        ].filter(Boolean).join('\n')

        delete global.blackjack[userId]
        await conn.sendMessage(m.chat, { text }, { quoted: m })
        await m.react('💥')
        return true
      }

      const text = [
        `╔══〔 🌼 *BLACKJACK* 〕══╗`,
        `║`,
        `║ 🎴 *Tu mano:* ${manoVisual(game.jugador)}`,
        `║ 🔢 *Total:* ${total}`,
        `║`,
        `║ 🤖 *Bot:* ${game.bot[0].valor}${game.bot[0].palo} 🔲`,
        `║`,
        `║ 👇 *¿Pides carta o te plantas?*`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')

      const msg = crearMensaje(m.chat, text, userId, m)
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      return true
    }

    if (accion === 'stand') {
      let totalBot = calcularTotal(game.bot)
      while (totalBot < 17) {
        game.bot.push(nuevaCarta())
        totalBot = calcularTotal(game.bot)
      }

      const totalJugador = calcularTotal(game.jugador)
      let resultado, emoji, ganancia = 0

      if (totalBot > 21 || totalJugador > totalBot) {
        ganancia = game.apuesta * 2
        resultado = `🎉 *¡Ganaste!*`
        emoji = '🎉'
        if (ganancia > 0) {
          global.db.data.users[userId].coin = (global.db.data.users[userId].coin || 0) + ganancia
          await global.db.write()
        }
      } else if (totalJugador === totalBot) {
        ganancia = game.apuesta
        resultado = `🤝 *¡Empate!*`
        emoji = '🤝'
        if (ganancia > 0) {
          global.db.data.users[userId].coin = (global.db.data.users[userId].coin || 0) + ganancia
          await global.db.write()
        }
      } else {
        resultado = `😢 *¡Perdiste!*`
        emoji = '😢'
      }

      const text = [
        `╔══〔 🌼 *BLACKJACK* 〕══╗`,
        `║`,
        `║ 🎴 *Tu mano:* ${manoVisual(game.jugador)} (${totalJugador})`,
        `║ 🤖 *Bot:* ${manoVisual(game.bot)} (${totalBot})`,
        `║`,
        `║ ${resultado}`,
        ganancia > 0 ? `║ 💰 *+${ganancia}* ${moneda}` : '',
        `║`,
        `╚══════════════════════════════════╝`
      ].filter(Boolean).join('\n')

      delete global.blackjack[userId]
      await conn.sendMessage(m.chat, { text }, { quoted: m })
      await m.react(emoji)
      return true
    }

  } catch (e) {
    console.error('❌ Error en blackjack:', e.message)
  }
}

handler.command  = ['blackjack', 'bj']
handler.tags     = ['game']
handler.help     = ['blackjack [apuesta]']
handler.register  = true
handler.desc      = 'Juega blackjack contra el bot'

export default handler
