import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const PALABRAS = [
  'CASAS','PERRO','GATOS','LIBRO','MUNDO','TIEMPO','FUEGO','AGUA',
  'PLANT','VERDE','NEGRO','BLANC','PIEDR','ARBOL','NUBES','LUNA',
  'SOLES','MARES','RIOS','CIELO'
].filter(p => p.length === 5)

function evaluarIntento(intento, palabra) {
  const resultado = []
  const palabraArr = palabra.split('')
  const intentoArr = intento.split('')
  const usados = Array(5).fill(false)

  // Primero verdes (posición correcta)
  for (let i = 0; i < 5; i++) {
    if (intentoArr[i] === palabraArr[i]) {
      resultado[i] = '🟩'
      usados[i] = true
    }
  }

  // Luego amarillos (letra existe, posición incorrecta)
  for (let i = 0; i < 5; i++) {
    if (resultado[i]) continue
    const idx = palabraArr.findIndex((l, j) => l === intentoArr[i] && !usados[j])
    if (idx !== -1) {
      resultado[i] = '🟨'
      usados[idx] = true
    } else {
      resultado[i] = '⬛'
    }
  }

  return resultado
}

function crearMensaje(chat, text, userId, m) {
  const letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').map(l => ({
    title: l,
    id: `wordle_letra_${l}_${userId}`
  }))

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '🔤 ARMAR PALABRA',
      sections: [{ title: '📝 Construye tu intento letra por letra', rows: letras }]
    })
  }]

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: { title: '🌼 THEELY-MD — WORDLE', subtitle: 'Adivina la palabra de 5 letras', hasMediaAttachment: false },
          body: { text },
          footer: { text: '🎮 Powered by TheEly-MD 🌼' },
          nativeFlowMessage: { buttons }
        })
      }
    }
  }, { quoted: m })
}

let handler = async (m, { conn, text, command }) => {
  global.wordle = global.wordle || {}

  if (global.wordle[m.sender]) return m.reply([
    `╔══〔 🌼 *WORDLE* 〕══╗`,
    `║`,
    `║ ⚠️ Ya tienes un juego activo~`,
    `║ Usa *.intento <palabra>* para jugar`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const palabra = PALABRAS[Math.floor(Math.random() * PALABRAS.length)]

  global.wordle[m.sender] = {
    palabra,
    intentos: [],
    maxIntentos: 6,
    construyendo: ''
  }

  await m.react('🔤')

  const text2 = [
    `╔══〔 🌼 *WORDLE* 〕══╗`,
    `║`,
    `║ 🎯 *Adivina la palabra de 5 letras*`,
    `║`,
    `║ 🔁 *Intentos:* 0/6`,
    `║`,
    `║ 💡 *Dos formas de jugar:*`,
    `║ 1️⃣ Escribe *.intento PALAB*`,
    `║ 2️⃣ Usa los botones para armar`,
    `║    letra por letra`,
    `║`,
    `║ 🟩 = letra correcta`,
    `║ 🟨 = existe, mal posición`,
    `║ ⬛ = no existe`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const msg = crearMensaje(m.chat, text2, m.sender, m)
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.before = async (m, { conn, command, text: msgText }) => {
  // ── Modo botones: armar letra por letra ──
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (nativeFlow) {
    try {
      const data = JSON.parse(nativeFlow.paramsJson || '{}')
      const id = data.id
      if (!id?.startsWith('wordle_letra_')) return

      const partes = id.split('_')
      const letra = partes[2]
      const userId = partes[3]

      const game = global.wordle?.[userId]
      if (!game) {
        await conn.sendMessage(m.chat, { text: `❌ No hay juego activo~ Usa *.wordle*` }, { quoted: m })
        return true
      }

      game.construyendo += letra

      if (game.construyendo.length < 5) {
        await conn.sendMessage(m.chat, {
          text: `🔤 Construyendo: *${game.construyendo}*${'_'.repeat(5 - game.construyendo.length)}\n💡 Sigue eligiendo letras (faltan ${5 - game.construyendo.length})`
        }, { quoted: m })
        const msg = crearMensaje(m.chat, `🔤 Continúa armando: *${game.construyendo}*`, userId, m)
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
        return true
      }

      // ── Palabra de 5 letras completa, evaluar ──
      const intento = game.construyendo
      game.construyendo = ''
      return await procesarIntento(m, conn, userId, intento)

    } catch (e) {
      console.error('❌ Error en wordle botones:', e.message)
    }
    return
  }

  // ── Modo comando: .intento PALAB ──
  if (command !== 'intento') return false
  const game = global.wordle?.[m.sender]
  if (!game) return false

  const intento = (msgText || '').trim().toUpperCase()
  if (intento.length !== 5) {
    await conn.sendMessage(m.chat, { text: `❌ La palabra debe tener exactamente 5 letras~` }, { quoted: m })
    return true
  }

  return await procesarIntento(m, conn, m.sender, intento)
}

async function procesarIntento(m, conn, userId, intento) {
  const game = global.wordle[userId]
  if (!game) return true

  const moneda = global.moneda || 'coins'
  const resultado = evaluarIntento(intento, game.palabra)
  game.intentos.push({ palabra: intento, resultado })

  const gano = intento === game.palabra
  const tablero = game.intentos.map(i => `║ ${i.palabra.split('').join(' ')}\n║ ${i.resultado.join(' ')}`).join('\n║\n')

  if (gano) {
    const recompensa = Math.max(50, 300 - (game.intentos.length - 1) * 40)

    if (!global.db.data.users[userId]) global.db.data.users[userId] = { coin: 0 }
    global.db.data.users[userId].coin = (global.db.data.users[userId].coin || 0) + recompensa
    await global.db.write()

    const text = [
      `╔══〔 🌼 *WORDLE* 〕══╗`,
      `║`,
      tablero,
      `║`,
      `║ 🏆 *¡GANASTE!*`,
      `║ 🔁 *Intentos:* ${game.intentos.length}/6`,
      `║ 💰 *+${recompensa}* ${moneda}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    delete global.wordle[userId]
    await conn.sendMessage(m.chat, { text }, { quoted: m })
    await m.react('🏆')
    return true
  }

  if (game.intentos.length >= game.maxIntentos) {
    const text = [
      `╔══〔 🌼 *WORDLE* 〕══╗`,
      `║`,
      tablero,
      `║`,
      `║ 💀 *¡Sin intentos!*`,
      `║ 📖 La palabra era: *${game.palabra}*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    delete global.wordle[userId]
    await conn.sendMessage(m.chat, { text }, { quoted: m })
    await m.react('💀')
    return true
  }

  const text = [
    `╔══〔 🌼 *WORDLE* 〕══╗`,
    `║`,
    tablero,
    `║`,
    `║ 🔁 *Intentos:* ${game.intentos.length}/6`,
    `║`,
    `║ 💡 *.intento PALAB* o usa botones`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  await m.react(intento === game.palabra ? '🏆' : '🔤')
  await conn.sendMessage(m.chat, { text }, { quoted: m })
  return true
}

handler.command = ['wordle', 'intento']
handler.tags    = ['game']
handler.help    = ['wordle', 'intento <palabra>']
handler.register = true
handler.desc    = 'Adivina la palabra de 5 letras y gana ElyCoins'

export default handler
