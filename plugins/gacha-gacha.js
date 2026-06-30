import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PERSONAJES = JSON.parse(fs.readFileSync(path.join(__dirname, 'lib', 'gacha-personajes.json'), 'utf-8'))

const RAREZAS = {
  comun:        { nombre: 'Común',        emoji: '⚪', prob: 50,   precio: 100  },
  raro:         { nombre: 'Raro',         emoji: '🔵', prob: 30,   precio: 100  },
  epico:        { nombre: 'Épico',        emoji: '🟣', prob: 13,   precio: 100  },
  legendario:   { nombre: 'Legendario',   emoji: '🟡', prob: 6,    precio: 100  },
  mitico:       { nombre: 'Mítico',       emoji: '🔴', prob: 0.9,  precio: 100  },
  ely_especial: { nombre: 'Ely Especial', emoji: '🌼', prob: 0.1,  precio: 100  },
}

const COSTO_TIRADA = 100
const COOLDOWN     = 5 * 60 * 1000

function tirarGacha() {
  const rand = Math.random() * 100
  let acum   = 0
  for (const [key, r] of Object.entries(RAREZAS)) {
    acum += r.prob
    if (rand <= acum) {
      const personajesRareza = PERSONAJES[key]
      const personaje = personajesRareza[Math.floor(Math.random() * personajesRareza.length)]
      return { rareza: key, ...RAREZAS[key], personaje }
    }
  }
  const fallback = PERSONAJES.comun[0]
  return { rareza: 'comun', ...RAREZAS.comun, personaje: fallback }
}

const handler = async (m, { conn, args }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const cantidad = args[0] === '10' ? 10 : 1
  const costoTotal = COSTO_TIRADA * cantidad

  const ahora  = Date.now()
  const ultimo = user.lastgacha || 0
  const espera = COOLDOWN - (ahora - ultimo)

  if (espera > 0 && cantidad === 1) {
    const min = Math.floor(espera / 60000)
    const s   = Math.floor((espera % 60000) / 1000)
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — GACHA* 〕══╗`,
      `║`,
      `║ ⏳ *Gacha en recarga~*`,
      `║`,
      `║ 🕐 *Disponible en:*`,
      `║ ${String(min).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`,
      `║`,
      `║ 💡 *.gacha 10* sin cooldown`,
      `║ (cuesta ${COSTO_TIRADA * 10} ${moneda})`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  if ((user.coin || 0) < costoTotal) return m.reply([
    `╔══〔 🌼 *THEELY-MD — GACHA* 〕══╗`,
    `║`,
    `║ ❌ *Saldo insuficiente~*`,
    `║ 💰 Necesitas: ${costoTotal} ${moneda}`,
    `║ 👛 Tienes: ${user.coin || 0} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  global.db.data.users[m.sender].coin -= costoTotal
  if (cantidad === 1) global.db.data.users[m.sender].lastgacha = ahora

  if (!global.db.data.users[m.sender].coleccion) global.db.data.users[m.sender].coleccion = []

  const resultados = []
  for (let i = 0; i < cantidad; i++) {
    const tirada = tirarGacha()
    resultados.push(tirada)
    global.db.data.users[m.sender].coleccion.push({
      nombre: tirada.personaje.nombre,
      origen: tirada.personaje.origen,
      rareza: tirada.rareza,
      fecha: Date.now()
    })
  }

  await global.db.write()

  const mejorTirada = resultados.reduce((a, b) =>
    RAREZAS[b.rareza].prob < RAREZAS[a.rareza].prob ? b : a
  )

  await m.react(mejorTirada.emoji)

  if (cantidad === 1) {
    const t = resultados[0]
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — GACHA* 〕══╗`,
        `║`,
        `║ 🎴 *¡Tirada completada!*`,
        `║`,
        `║ ${t.emoji} *${t.nombre}*`,
        `║`,
        `║ ${t.personaje.emoji} *${t.personaje.nombre}*`,
        `║ 📺 ${t.personaje.origen}`,
        `║`,
        `║ 👛 *Saldo:* ${global.db.data.users[m.sender].coin} ${moneda}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  } else {
    const lista = resultados.map((t, i) =>
      `║ ${i+1}. ${t.emoji} ${t.personaje.emoji} *${t.personaje.nombre}*`
    ).join('\n')

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — GACHA x10* 〕══╗`,
        `║`,
        `║ 🎴 *¡10 tiradas completadas!*`,
        `║`,
        lista,
        `║`,
        `║ ⭐ *Mejor obtenido:*`,
        `║ ${mejorTirada.emoji} ${mejorTirada.personaje.nombre}`,
        `║`,
        `║ 👛 *Saldo:* ${global.db.data.users[m.sender].coin} ${moneda}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }
}

handler.help     = ['gacha [10]']
handler.tags     = ['gacha']
handler.command  = ['gacha', 'tirar', 'roll']
handler.register = true
handler.desc     = 'Realiza una tirada de gacha (100 coins)'

export default handler
