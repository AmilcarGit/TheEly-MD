import fetch from 'node-fetch'

const sesiones = {}
const RECOMPENSA = { min: 50, max: 150 }

const handler = async (m, { conn }) => {
  const moneda = global.moneda || 'coins'

  if (sesiones[m.chat]) return m.reply([
    `╔══〔 🌼 *THEELY-MD — TRIVIA* 〕══╗`,
    `║`,
    `║ ⚠️ Ya hay una trivia activa~`,
    `║ Responde la pregunta actual`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  await m.react('🧠')

  try {
    const res  = await fetch('https://opentdb.com/api.php?amount=1&category=31&type=multiple')
    const json = await res.json()

    if (!json.results?.[0]) throw new Error('Sin preguntas disponibles')

    const data = json.results[0]
    const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')

    const pregunta = decode(data.question)
    const correcta = decode(data.correct_answer)
    const incorrectas = data.incorrect_answers.map(decode)

    const opciones = [...incorrectas, correcta].sort(() => Math.random() - 0.5)
    const letras = ['A', 'B', 'C', 'D']
    const indiceCorrecta = opciones.indexOf(correcta)

    sesiones[m.chat] = {
      correcta: letras[indiceCorrecta],
      respuesta: correcta,
      tiempo: setTimeout(() => {
        if (sesiones[m.chat]) {
          conn.sendMessage(m.chat, {
            text: `╔══〔 🌼 *THEELY-MD — TRIVIA* 〕══╗\n║\n║ ⏰ *¡Tiempo agotado!*\n║ La respuesta era: *${letras[indiceCorrecta]}) ${correcta}*\n║\n╚══════════════════════════════════╝`
          })
          delete sesiones[m.chat]
        }
      }, 30000)
    }

    const listaOpciones = opciones.map((op, i) => `║ ${letras[i]}) ${op}`).join('\n')

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — TRIVIA* 〕══╗`,
        `║`,
        `║ 🧠 *${pregunta}*`,
        `║`,
        listaOpciones,
        `║`,
        `║ ⏰ Tienes 30 segundos~`,
        `║ 💡 Responde con la letra (A, B, C, D)`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

  } catch (e) {
    await m.react('❌')
    m.reply(`❌ Error al cargar la trivia, intenta de nuevo~`)
  }
}

handler.before = async (m, { conn }) => {
  const sesion = sesiones[m.chat]
  if (!sesion || !m.text) return false

  const respuesta = m.text.trim().toUpperCase()
  if (!['A', 'B', 'C', 'D'].includes(respuesta)) return false

  clearTimeout(sesion.tiempo)
  const moneda = global.moneda || 'coins'

  if (respuesta === sesion.correcta) {
    const recompensa = Math.floor(Math.random() * (RECOMPENSA.max - RECOMPENSA.min + 1)) + RECOMPENSA.min
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { coin: 0 }
    global.db.data.users[m.sender].coin = (global.db.data.users[m.sender].coin || 0) + recompensa
    await global.db.write()

    await m.react('✅')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — TRIVIA* 〕══╗`,
        `║`,
        `║ ✅ *¡Correcto!*`,
        `║`,
        `║ 👤 @${m.sender.split('@')[0]}`,
        `║ 💰 *+${recompensa}* ${moneda}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'),
      mentions: [m.sender]
    }, { quoted: m })
  } else {
    await m.react('❌')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — TRIVIA* 〕══╗`,
        `║`,
        `║ ❌ *Incorrecto~*`,
        `║`,
        `║ La respuesta era: *${sesion.correcta}) ${sesion.respuesta}*`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }

  delete sesiones[m.chat]
  return true
}

handler.help    = ['trivia']
handler.tags    = ['game']
handler.command = ['trivia', 'quiz']
handler.register = true
handler.desc    = 'Juega trivia y gana ElyCoins'

export default handler
