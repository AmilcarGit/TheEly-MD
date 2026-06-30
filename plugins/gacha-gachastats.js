const RAREZAS = {
  comun: { nombre: 'Común', emoji: '⚪' },
  raro: { nombre: 'Raro', emoji: '🔵' },
  epico: { nombre: 'Épico', emoji: '🟣' },
  legendario: { nombre: 'Legendario', emoji: '🟡' },
  mitico: { nombre: 'Mítico', emoji: '🔴' },
  ely_especial: { nombre: 'Ely Especial', emoji: '🌼' },
}

const handler = async (m, { conn }) => {
  const quien  = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const user   = global.db.data.users[quien]
  const moneda = global.moneda || 'coins'
  const esTuyo = quien === m.sender

  const coleccion = user?.coleccion || []

  if (!coleccion.length) return m.reply([
    `╔══〔 🌼 *THEELY-MD — GACHA STATS* 〕══╗`,
    `║`,
    `║ 📊 *Sin estadísticas aún~*`,
    `║ Usa *.gacha* para empezar`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const conteo = {}
  for (const item of coleccion) {
    conteo[item.rareza] = (conteo[item.rareza] || 0) + 1
  }

  const totalTiradas = coleccion.length
  const gastoEstimado = totalTiradas * 100
  const unicos = new Set(coleccion.map(c => c.nombre)).size

  const desglose = Object.entries(RAREZAS).map(([key, r]) => {
    const cant = conteo[key] || 0
    const pct  = totalTiradas > 0 ? ((cant / totalTiradas) * 100).toFixed(1) : 0
    return `║ ${r.emoji} *${r.nombre}:* ${cant} (${pct}%)`
  }).join('\n')

  const mejorObtenido = coleccion.reduce((mejor, actual) => {
    const orden = { comun: 1, raro: 2, epico: 3, legendario: 4, mitico: 5, ely_especial: 6 }
    return orden[actual.rareza] > orden[mejor.rareza] ? actual : mejor
  }, coleccion[0])

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — GACHA STATS* 〕══╗`,
      `║`,
      `║ 📊 ${esTuyo ? '*Tus estadísticas*' : `*@${quien.split('@')[0]}*`}`,
      `║`,
      `║ 🎴 *Total tiradas:* ${totalTiradas}`,
      `║ 🆔 *Personajes únicos:* ${unicos}`,
      `║ 💰 *Gasto estimado:* ${gastoEstimado} ${moneda}`,
      `║`,
      `╠══〔 📋 *DESGLOSE* 〕═══════════════╣`,
      `║`,
      desglose,
      `║`,
      `╠══〔 🏆 *MEJOR OBTENIDO* 〕═════════╣`,
      `║`,
      `║ ${RAREZAS[mejorObtenido.rareza].emoji} *${mejorObtenido.nombre}*`,
      `║ 📺 ${mejorObtenido.origen}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'),
    mentions: [quien]
  }, { quoted: m })

  await m.react('📊')
}

handler.help     = ['gachastats']
handler.tags     = ['gacha']
handler.command  = ['gachastats', 'estadisticasgacha']
handler.register = true
handler.desc     = 'Ver tus estadísticas de tiradas gacha'
export default handler
