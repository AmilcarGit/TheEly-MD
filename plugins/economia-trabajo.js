const TRABAJOS = [
  { nombre: 'Programador',  min: 80,  max: 200 },
  { nombre: 'Chef',         min: 60,  max: 180 },
  { nombre: 'Médico',       min: 100, max: 250 },
  { nombre: 'Músico',       min: 50,  max: 150 },
  { nombre: 'Diseñador',    min: 70,  max: 190 },
  { nombre: 'Detective',    min: 90,  max: 220 },
  { nombre: 'Piloto',       min: 120, max: 300 },
  { nombre: 'Streamer',     min: 40,  max: 160 },
  { nombre: 'Mecánico',     min: 60,  max: 170 },
  { nombre: 'Agricultor',   min: 30,  max: 120 },
]

const FRASES = [
  'Trabajaste duro y ganaste',
  'Tu esfuerzo fue recompensado con',
  'Completaste tu turno y recibiste',
  'Excelente trabajo, ganaste',
  'Tu jefe quedó satisfecho y te pagó',
]

const COOLDOWN = 60 * 60 * 1000

const handler = async (m, { conn }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const ahora  = Date.now()
  const ultimo = user.lastpago || 0
  const espera = COOLDOWN - (ahora - ultimo)

  if (espera > 0) {
    const min = Math.floor(espera / 60000)
    const s   = Math.floor((espera % 60000) / 1000)
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — TRABAJO* 〕══╗`,
      `║`,
      `║ ⏳ *Ya trabajaste hoy~*`,
      `║ Descansa un momento~`,
      `║`,
      `║ 🕐 *Disponible en:*`,
      `║ ${String(min).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const trabajo    = TRABAJOS[Math.floor(Math.random() * TRABAJOS.length)]
  const frase      = FRASES[Math.floor(Math.random() * FRASES.length)]
  const ganancia   = Math.floor(Math.random() * (trabajo.max - trabajo.min + 1)) + trabajo.min

  user.coin    = (user.coin || 0) + ganancia
  user.lastpago = ahora

  await m.react('💼')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — TRABAJO* 〕══╗`,
    `║`,
    `║ 💼 *Profesión:* ${trabajo.nombre}`,
    `║`,
    `║ ${frase}`,
    `║ 💰 *+${ganancia}* ${moneda}`,
    `║`,
    `║ 👛 *Billetera:* ${user.coin} ${moneda}`,
    `║ ⏰ Vuelve en 1 hora~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help     = ['trabajo']
handler.tags     = ['eco']
handler.command  = ['trabajo', 'trabajar', 'work']
handler.register = true
handler.desc     = 'Trabaja para ganar monedas'

export default handler
