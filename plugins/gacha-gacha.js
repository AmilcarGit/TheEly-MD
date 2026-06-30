import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PERSONAJES = JSON.parse(fs.readFileSync(path.join(__dirname, 'lib', 'gacha-personajes.json'), 'utf-8'))

const RAREZAS = {
  comun:        { nombre: 'Común',        emoji: '⚪', prob: 50   },
  raro:         { nombre: 'Raro',         emoji: '🔵', prob: 30   },
  epico:        { nombre: 'Épico',        emoji: '🟣', prob: 13   },
  legendario:   { nombre: 'Legendario',   emoji: '🟡', prob: 6    },
  mitico:       { nombre: 'Mítico',       emoji: '🔴', prob: 0.9  },
  ely_especial: { nombre: 'Ely Especial', emoji: '🌼', prob: 0.1  },
}

const COSTO_TIRADA = 0
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

// ── Buscar imagen del personaje (Bing image search sin API key) ──
async function buscarImagen(nombrePersonaje, origen) {
  try {
    // Limpiar nombre (quitar paréntesis, símbolos raros, emojis)
    const nombreLimpio = nombrePersonaje
      .replace(/\(.*?\)/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim()

    const query = encodeURIComponent(`${nombreLimpio} ${origen} official art character`)
    const res = await fetch(`https://www.bing.com/images/search?q=${query}&form=HDRSC2&first=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    })
    const html = await res.text()

    // Extraer varias coincidencias y tomar la primera válida
    const matches = [...html.matchAll(/murl&quot;:&quot;(https:\/\/[^&]+\.(?:jpg|jpeg|png|webp))/gi)]

    for (const match of matches.slice(0, 5)) {
      const url = match[1]
      // Validar que la imagen realmente carga
      try {
        const check = await fetch(url, { method: 'HEAD', timeout: 5000 })
        if (check.ok && check.headers.get('content-type')?.startsWith('image/')) {
          return url
        }
      } catch {}
    }

    return null
  } catch {
    return null
  }
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
      `║ 💡 *.gacha 10* para 10 tiradas`,
      `║ sin cooldown~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  await m.react('🎴')

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

  // ── 1 SOLA TIRADA — con imagen ──
  if (cantidad === 1) {
    const t = resultados[0]
    const imagen = await buscarImagen(t.personaje.nombre, t.personaje.origen)

    const caption = [
      `╔══〔 🌼 *THEELY-MD — GACHA* 〕══╗`,
      `║`,
      `║ 🎴 *¡Tirada completada!*`,
      `║`,
      `║ ${t.emoji} *${t.nombre}*`,
      `║`,
      `║ ${t.personaje.emoji} *${t.personaje.nombre}*`,
      `║ 📺 ${t.personaje.origen}`,
      `║`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    await m.react(t.emoji)

    if (imagen) {
      await conn.sendMessage(m.chat, { image: { url: imagen }, caption }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    }
    return
  }

  // ── 10 TIRADAS — solo texto (evitar saturar) ──
  const lista = resultados.map((t, i) =>
    `║ ${i+1}. ${t.emoji} ${t.personaje.emoji} *${t.personaje.nombre}*`
  ).join('\n')

  await m.react(mejorTirada.emoji)
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
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })
}

handler.help     = ['gacha [10]']
handler.tags     = ['gacha']
handler.command  = ['gacha', 'tirar', 'roll']
handler.register = true
handler.desc     = 'Realiza una tirada de gacha (100 coins)'

export default handler
