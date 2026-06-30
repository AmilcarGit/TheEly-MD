import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const categorias = {
  '💻 Tecnología': ['JAVASCRIPT', 'ANDROID', 'WHATSAPP', 'PROGRAMACION', 'COMPUTADORA', 'INTERNET', 'BAILEYS', 'SERVIDOR'],
  '🎮 Videojuegos': ['MINECRAFT', 'FREEFIRE', 'FORTNITE', 'POKEMON', 'ROBLOX', 'VALORANT'],
  '🌼 TheEly':     ['THEELY', 'AMILCAR', 'PLUGIN', 'HANDLER', 'SUBBOT', 'GACHA'],
  '🌎 Países':     ['COLOMBIA', 'MEXICO', 'ARGENTINA', 'VENEZUELA', 'PERU', 'BRASIL']
}

const todasLasPalabras = Object.entries(categorias).flatMap(([cat, words]) =>
  words.map(w => ({ palabra: w, categoria: cat }))
)

const dibujos = [
  '  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========',
  '  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========',
  '  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========',
  '  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========',
  '  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========',
  '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========',
  '  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========='
]

function crearMensaje(chat, text, userId, m) {
  const letrasDisponibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({
    title: l,
    id: `ahorcado_${l}_${userId}`
  }))

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '🔤 ELIGE UNA LETRA',
      sections: [{
        title: '🔤 Letras disponibles',
        rows: letrasDisponibles
      }]
    })
  }]

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: {
            title: '🌼 THEELY-MD — AHORCADO',
            subtitle: 'Adivina la palabra letra por letra',
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
  global.ahorcado = global.ahorcado || {}

  const seleccion = todasLasPalabras[Math.floor(Math.random() * todasLasPalabras.length)]

  global.ahorcado[m.sender] = {
    palabra:   seleccion.palabra,
    categoria: seleccion.categoria,
    usadas:    [],
    vidas:     6,
    inicio:    Date.now()
  }

  const progreso = '\\_ '.repeat(seleccion.palabra.length).trim()

  const text = [
    `╔══〔 🌼 *AHORCADO* 〕══╗`,
    `║`,
    `║ ${dibujos[0]}`,
    `║`,
    `║ ❤️ *Vidas:* 6/6`,
    `║ 📂 *Categoría:* ${seleccion.categoria}`,
    `║ 🔤 *Letras:* ${seleccion.palabra.length}`,
    `║`,
    `║ 📝 ${progreso}`,
    `║`,
    `║ 🔡 *Usadas:* Ninguna`,
    `║`,
    `║ 👇 *Elige una letra para empezar~*`,
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
    if (!id?.startsWith('ahorcado_')) return

    const [, letra, userId] = id.split('_')
    const game = global.ahorcado?.[userId]
    if (!game) {
      await conn.sendMessage(m.chat, {
        text: `╔══〔 🌼 *AHORCADO* 〕══╗\n║\n║ ❌ No hay partida activa~\n║ 💡 Usa *.ahorcado* para empezar\n║\n╚══════════════════════════════════╝`
      }, { quoted: m })
      return true
    }

    if (game.usadas.includes(letra)) {
      await conn.sendMessage(m.chat, {
        text: `╔══〔 🌼 *AHORCADO* 〕══╗\n║\n║ ⚠️ Ya usaste la letra *${letra}*~\n║ 💡 Elige otra letra\n║\n╚══════════════════════════════════╝`
      }, { quoted: m })
      return true
    }

    game.usadas.push(letra)
    const acierto = game.palabra.includes(letra)
    if (!acierto) game.vidas--

    const progreso = game.palabra.split('').map(l => game.usadas.includes(l) ? l : '\\_').join(' ')

    let estado = ''
    let reaccion = acierto ? '✅' : '❌'

    const gano = game.palabra.split('').every(l => game.usadas.includes(l))
    const perdio = game.vidas <= 0

    if (gano) {
      const tiempoSeg = Math.floor((Date.now() - game.inicio) / 1000)
      estado = `🏆 *¡GANASTE!* 🎉\n║ ⏱️ Tiempo: ${tiempoSeg}s`
      reaccion = '🏆'

      const moneda = global.moneda || 'coins'
      const xp    = Math.floor(Math.random() * 50) + 20
      const coins = Math.floor(Math.random() * 100) + 50

      if (!global.db.data.users[userId]) global.db.data.users[userId] = { coin: 0, exp: 0 }
      global.db.data.users[userId].exp  = (global.db.data.users[userId].exp || 0) + xp
      global.db.data.users[userId].coin = (global.db.data.users[userId].coin || 0) + coins
      await global.db.write()

      estado += `\n║ ✨ *+${xp} XP*  💰 *+${coins} ${moneda}*`
    } else if (perdio) {
      estado = `💀 *¡PERDISTE!*\n║ 📖 Palabra: *${game.palabra}*`
      reaccion = '💀'
    } else {
      estado = acierto
        ? `✅ *¡Letra correcta!* "${letra}"`
        : `❌ *Letra incorrecta* "${letra}" — ${game.vidas} vida(s) restantes`
    }

    const dibujoActual = dibujos[6 - game.vidas] || dibujos[6]

    const text = [
      `╔══〔 🌼 *AHORCADO* 〕══╗`,
      `║`,
      `║ ${dibujoActual}`,
      `║`,
      `║ ❤️ *Vidas:* ${'❤️'.repeat(game.vidas)}${'🖤'.repeat(6 - game.vidas)}`,
      `║ 📂 *Categoría:* ${game.categoria}`,
      `║`,
      `║ 📝 ${progreso}`,
      `║`,
      `║ 🔡 *Usadas:* ${game.usadas.join(' ')}`,
      `║`,
      `║ ${estado}`,
      `║`,
      gano || perdio ? '' : `║ 👇 *Elige otra letra~*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].filter(v => v !== undefined).join('\n')

    if (gano || perdio) delete global.ahorcado[userId]

    const msg = crearMensaje(m.chat, text, userId, m)
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react(reaccion)
    return true

  } catch (e) {
    console.error('❌ Error en ahorcado:', e.message)
  }
}

handler.command = ['ahorcado']
handler.tags    = ['game']
handler.help    = ['ahorcado']
handler.register = true
handler.desc    = 'Juega al ahorcado y gana ElyCoins'

export default handler
