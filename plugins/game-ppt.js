import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const OPCIONES = ['✊ Piedra', '📄 Papel', '✂️ Tijera']
const EMOJIS = ['✊', '📄', '✂️']
const NOMBRES = ['Piedra', 'Papel', 'Tijera']

function crearMensaje(chat, text, userId, m, opciones = []) {
  const rows = opciones.map((op, index) => ({
    title: op,
    id: `ppt_${index}_${userId}`
  }))

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '🎯 ELIGE TU JUGADA',
      sections: [{
        title: '🔄 Opciones',
        rows
      }]
    })
  }]

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: {
            title: '🌼 THEELY-MD — PPT',
            subtitle: 'Piedra, Papel o Tijera',
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
  const args = m.text.split(' ').slice(1)
  const user = global.db.data.users[m.sender]

  if (args[0] && args[0].toLowerCase() === 'stats') {
    const stats = user.pptStats || { victorias: 0, derrotas: 0, empates: 0, racha: 0, maxRacha: 0 }
    const total = stats.victorias + stats.derrotas + stats.empates
    const porcentaje = total > 0 ? Math.round((stats.victorias / total) * 100) : 0

    const mensaje = [
      `╔══〔 🌼 *ESTADÍSTICAS PPT* 〕══╗`,
      `║`,
      `║ 🏆 *Victorias:* ${stats.victorias}`,
      `║ 💀 *Derrotas:* ${stats.derrotas}`,
      `║ 🤝 *Empates:* ${stats.empates}`,
      `║ 📊 *Total:* ${total}`,
      `║ 📈 *Efectividad:* ${porcentaje}%`,
      `║ 🔥 *Racha actual:* ${stats.racha}`,
      `║ 🏅 *Mejor racha:* ${stats.maxRacha}`,
      `║`,
      `║ 💡 Usa .ppt para jugar`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m })
    return
  }

  const partidas = global.db.data.pptPartidas || {}
  if (partidas[m.sender]) {
    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *PPT* 〕══╗\n║\n║ ⚠️ *Ya tienes una partida activa*\n║ 💡 Termina o espera a que termine\n║\n╚══════════════════════════════════╝`
    }, { quoted: m })
    return
  }

  const maxRondas = parseInt(args[0]) || 3
  if (maxRondas < 1 || maxRondas > 9) {
    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *PPT* 〕══╗\n║\n║ ❌ *Rondas inválidas* (1-9)\n║ 💡 Usa: .ppt <rondas>\n║ Ejemplo: .ppt 5\n║\n╚══════════════════════════════════╝`
    }, { quoted: m })
    return
  }

  partidas[m.sender] = {
    ronda: 0,
    maxRondas: maxRondas,
    victorias: 0,
    derrotas: 0,
    empates: 0,
    inicio: Date.now(),
    historial: []
  }

  global.db.data.pptPartidas = partidas
  await global.db.write()

  await enviarRonda(m, conn, m.sender)
}

async function enviarRonda(m, conn, userId) {
  const partidas = global.db.data.pptPartidas || {}
  const juego = partidas[userId]
  if (!juego) return

  const { ronda, maxRondas, victorias, derrotas, empates } = juego
  const tiempoSeg = Math.floor((Date.now() - juego.inicio) / 1000)

  const texto = [
    `╔══〔 🌼 *PIEDRA, PAPEL O TIJERA* 〕══╗`,
    `║`,
    `║ 🎯 *Ronda ${ronda + 1}/${maxRondas}*`,
    `║ 🏆 *Victorias:* ${victorias}`,
    `║ 💀 *Derrotas:* ${derrotas}`,
    `║ 🤝 *Empates:* ${empates}`,
    `║ ⏱️ *Tiempo:* ${tiempoSeg}s`,
    `║`,
    `║ 👇 *Elige tu jugada*`,
    `║`,
    ...OPCIONES.map((op, i) => `║ ${i+1}. ${op}`),
    `║`,
    `║ 💡 *Gana quien llegue a ${Math.ceil(maxRondas/2)} victorias*`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const msg = crearMensaje(m.chat, texto, userId, m, OPCIONES)
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id
    if (!id?.startsWith('ppt_')) return

    const [, jugadaIndex, userId] = id.split('_')
    const partidas = global.db.data.pptPartidas || {}
    const juego = partidas[userId]
    if (!juego) {
      await conn.sendMessage(m.chat, { text: '❌ *No hay partida activa.* Usa .ppt para empezar.' }, { quoted: m })
      return true
    }

    const jugadaUsuario = parseInt(jugadaIndex)
    const jugadaBot = Math.floor(Math.random() * 3)

    let resultado = ''
    let ganador = 0

    if (jugadaUsuario === jugadaBot) {
      resultado = '🤝 Empate'
      ganador = 0
      juego.empates++
    } else if (
      (jugadaUsuario === 0 && jugadaBot === 2) ||
      (jugadaUsuario === 1 && jugadaBot === 0) ||
      (jugadaUsuario === 2 && jugadaBot === 1)
    ) {
      resultado = '✅ ¡Ganaste!'
      ganador = 1
      juego.victorias++
    } else {
      resultado = '❌ Perdiste'
      ganador = 2
      juego.derrotas++
    }

    juego.ronda++
    juego.historial.push({
      usuario: jugadaUsuario,
      bot: jugadaBot,
      ganador: ganador
    })

    const emojiUsuario = EMOJIS[jugadaUsuario]
    const emojiBot = EMOJIS[jugadaBot]
    const nombreUsuario = NOMBRES[jugadaUsuario]
    const nombreBot = NOMBRES[jugadaBot]

    const textoRonda = [
      `╔══〔 🌼 *PPT — RONDA ${juego.ronda}* 〕══╗`,
      `║`,
      `║ 👤 Tú: ${emojiUsuario} ${nombreUsuario}`,
      `║ 🤖 Bot: ${emojiBot} ${nombreBot}`,
      `║`,
      `║ *${resultado}*`,
      `║`,
      `║ 🏆 *Victorias:* ${juego.victorias}`,
      `║ 💀 *Derrotas:* ${juego.derrotas}`,
      `║ 🤝 *Empates:* ${juego.empates}`,
      `║`,
      `║ ⏳ *Ronda ${juego.ronda}/${juego.maxRondas}*`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    await m.react(ganador === 1 ? '✅' : ganador === 2 ? '❌' : '🤝')
    await conn.sendMessage(m.chat, { text: textoRonda }, { quoted: m })

    const maxRondas = juego.maxRondas
    const victoriasNecesarias = Math.ceil(maxRondas / 2)

    if (juego.victorias >= victoriasNecesarias || juego.derrotas >= victoriasNecesarias || juego.ronda >= maxRondas) {
      const user = global.db.data.users[userId]
      if (!user) global.db.data.users[userId] = { exp: 0, coin: 0 }

      if (!user.pptStats) user.pptStats = { victorias: 0, derrotas: 0, empates: 0, racha: 0, maxRacha: 0 }
      const stats = user.pptStats

      let resultadoFinal = ''
      let premioXp = 0
      let premioCoins = 0

      if (juego.victorias > juego.derrotas) {
        resultadoFinal = '🏆 ¡GANASTE LA PARTIDA! 🎉'
        premioXp = Math.floor(Math.random() * 40) + 30
        premioCoins = Math.floor(Math.random() * 80) + 50
        stats.victorias++
        stats.racha = (stats.racha || 0) + 1
        if (stats.racha > stats.maxRacha) stats.maxRacha = stats.racha
      } else if (juego.victorias < juego.derrotas) {
        resultadoFinal = '💀 PERDISTE LA PARTIDA'
        premioXp = Math.floor(Math.random() * 10) + 5
        premioCoins = Math.floor(Math.random() * 20) + 10
        stats.derrotas++
        stats.racha = 0
      } else {
        resultadoFinal = '🤝 EMPATE EN LA PARTIDA'
        premioXp = Math.floor(Math.random() * 15) + 10
        premioCoins = Math.floor(Math.random() * 30) + 20
        stats.empates++
      }

      stats.victorias = stats.victorias || 0
      stats.derrotas = stats.derrotas || 0
      stats.empates = stats.empates || 0
      stats.racha = stats.racha || 0
      stats.maxRacha = stats.maxRacha || 0

      const moneda = global.moneda || '🌼 ElyCoins'
      user.exp = (user.exp || 0) + premioXp
      user.coin = (user.coin || 0) + premioCoins
      await global.db.write()

      const tiempoSeg = Math.floor((Date.now() - juego.inicio) / 1000)

      const mensajeFinal = [
        `╔══〔 🌼 *PPT — PARTIDA FINALIZADA* 〕══╗`,
        `║`,
        `║ ${resultadoFinal}`,
        `║`,
        `║ 📊 *Resultados:*`,
        `║ ✅ Victorias: ${juego.victorias}`,
        `║ ❌ Derrotas: ${juego.derrotas}`,
        `║ 🤝 Empates: ${juego.empates}`,
        `║ ⏱️ Tiempo: ${tiempoSeg}s`,
        `║`,
        `║ 🎁 *Premios:*`,
        `║ ✨ +${premioXp} XP`,
        `║ 💰 +${premioCoins} ${moneda}`,
        `║`,
        `║ 💡 Usa .ppt para jugar otra vez`,
        `║ 📊 Usa .ppt stats para ver tus estadísticas`,
        `╚══════════════════════════════════╝`
      ].join('\n')

      delete partidas[userId]
      global.db.data.pptPartidas = partidas
      await global.db.write()

      await conn.sendMessage(m.chat, { text: mensajeFinal }, { quoted: m })
      await m.react('🏆')
      return true
    }

    await enviarRonda(m, conn, userId)
    return true

  } catch (e) {
    console.error('❌ Error en PPT:', e.message)
  }
}

handler.command = ['ppt']
handler.tags    = ['game']
handler.help    = ['ppt [rondas]', 'ppt stats']
handler.register = true
handler.desc    = 'Piedra, papel o tijera con botones y estadísticas'

export default handler