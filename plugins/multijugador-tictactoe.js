import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

function tableroTexto(t) {
  const e = (i) => t[i] || (i + 1)
  return `${e(0)} │ ${e(1)} │ ${e(2)}\n──┼───┼──\n${e(3)} │ ${e(4)} │ ${e(5)}\n──┼───┼──\n${e(6)} │ ${e(7)} │ ${e(8)}`
}

function verificarGanador(t) {
  const lineas = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  for (const [a,b,c] of lineas) {
    if (t[a] && t[a] === t[b] && t[b] === t[c]) return t[a]
  }
  return t.every(c => c) ? 'empate' : null
}

function crearMensaje(chat, text, chatId, m) {
  const rows = Array.from({length: 9}, (_, i) => ({
    title: `Casilla ${i + 1}`,
    id: `ttt_${i}_${chatId}`
  }))

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '⭕ ELIGE UNA CASILLA',
      sections: [{ title: '🎮 Tablero (1-9)', rows }]
    })
  }]

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: {
            title: '🌼 THEELY-MD — 3 EN RAYA',
            subtitle: 'Elige tu casilla',
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
  global.ttt = global.ttt || {}

  if (global.ttt[m.chat]) return m.reply([
    `╔══〔 🌼 *3 EN RAYA* 〕══╗`,
    `║`,
    `║ ⚠️ Ya hay una partida activa~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const oponente = m.mentionedJid?.[0]
  if (!oponente) return m.reply([
    `╔══〔 🌼 *3 EN RAYA* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ .ttt @oponente`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (oponente === m.sender) return m.reply(`❌ No puedes jugar contigo mismo~`)

  global.ttt[m.chat] = {
    tablero: Array(9).fill(null),
    jugadorX: m.sender,
    jugadorO: oponente,
    turno: m.sender
  }

  await m.react('⭕')

  const text = [
    `╔══〔 🌼 *3 EN RAYA* 〕══╗`,
    `║`,
    `║ ❌ @${m.sender.split('@')[0]} (X)`,
    `║ ⭕ @${oponente.split('@')[0]} (O)`,
    `║`,
    tableroTexto(Array(9).fill(null)),
    `║`,
    `║ 🎮 Turno de X`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const msg = crearMensaje(m.chat, text, m.chat, m)
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id, mentions: [m.sender, oponente] })
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id
    if (!id?.startsWith('ttt_')) return

    const [, pos, chatId] = id.split('_')
    const game = global.ttt?.[chatId]
    if (!game) return true

    const moneda = global.moneda || 'coins'

    if (m.sender !== game.turno) {
      await conn.sendMessage(m.chat, { text: `⚠️ No es tu turno~` }, { quoted: m })
      return true
    }

    const posicion = parseInt(pos)
    if (game.tablero[posicion]) {
      await conn.sendMessage(m.chat, { text: `❌ Esa casilla ya está ocupada~` }, { quoted: m })
      return true
    }

    const simbolo = m.sender === game.jugadorX ? '❌' : '⭕'
    game.tablero[posicion] = simbolo

    const resultado = verificarGanador(game.tablero)

    if (resultado) {
      let text
      if (resultado === 'empate') {
        text = [
          `╔══〔 🌼 *3 EN RAYA* 〕══╗`,
          `║`,
          tableroTexto(game.tablero),
          `║`,
          `║ 🤝 *¡Empate!*`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
        await m.react('🤝')
      } else {
        const ganador = m.sender
        const recompensa = Math.floor(Math.random() * 150) + 100

        if (!global.db.data.users[ganador]) global.db.data.users[ganador] = { coin: 0 }
        global.db.data.users[ganador].coin = (global.db.data.users[ganador].coin || 0) + recompensa
        await global.db.write()

        text = [
          `╔══〔 🌼 *3 EN RAYA* 〕══╗`,
          `║`,
          tableroTexto(game.tablero),
          `║`,
          `║ 🎉 *¡@${ganador.split('@')[0]} ganó!*`,
          `║ 💰 *+${recompensa}* ${moneda}`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
        await m.react('🎉')
      }

      delete global.ttt[chatId]
      await conn.sendMessage(m.chat, { text, mentions: [game.jugadorX, game.jugadorO] }, { quoted: m })
      return true
    }

    game.turno = game.turno === game.jugadorX ? game.jugadorO : game.jugadorX

    const text = [
      `╔══〔 🌼 *3 EN RAYA* 〕══╗`,
      `║`,
      tableroTexto(game.tablero),
      `║`,
      `║ 🎮 Turno de @${game.turno.split('@')[0]}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    await m.react('✅')
    const msg = crearMensaje(m.chat, text, chatId, m)
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id, mentions: [game.turno] })
    return true

  } catch (e) {
    console.error('❌ Error en ttt:', e.message)
  }
}

handler.command = ['ttt', 'tictactoe']
handler.tags    = ['multijugador']
handler.help    = ['ttt @oponente']
handler.group   = true
handler.desc    = '3 en raya por parejas, gana ElyCoins'

export default handler
