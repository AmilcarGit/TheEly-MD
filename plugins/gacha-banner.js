import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PERSONAJES = JSON.parse(fs.readFileSync(path.join(__dirname, 'lib', 'gacha-personajes.json'), 'utf-8'))

// ── Banner actual con rate-up ──
const BANNER_ACTUAL = {
  titulo: '🌼 Banner Especial: Ely-chan',
  destacado: PERSONAJES.ely_especial[0],
  rarezaDestacada: 'ely_especial',
  rateUp: 0.5, // % extra para el destacado
  vigencia: 'Permanente'
}

const RAREZAS_BASE = {
  comun:        { nombre: 'Común',      emoji: '⚪', prob: 49.5 },
  raro:         { nombre: 'Raro',       emoji: '🔵', prob: 30   },
  epico:        { nombre: 'Épico',      emoji: '🟣', prob: 13   },
  legendario:   { nombre: 'Legendario', emoji: '🟡', prob: 6    },
  mitico:       { nombre: 'Mítico',     emoji: '🔴', prob: 0.9  },
  ely_especial: { nombre: 'Ely Especial (Rate-Up)', emoji: '🌼', prob: 0.6 },
}

const handler = async (m, { conn, usedPrefix }) => {
  const lista = Object.entries(RAREZAS_BASE).map(([key, r]) =>
    `║ ${r.emoji} *${r.nombre}* — ${r.prob}%`
  ).join('\n')

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — BANNER* 〕══╗`,
      `║`,
      `║ 🎪 *${BANNER_ACTUAL.titulo}*`,
      `║ 📅 *Vigencia:* ${BANNER_ACTUAL.vigencia}`,
      `║`,
      `║ ⭐ *Personaje destacado:*`,
      `║ ${BANNER_ACTUAL.destacado.emoji} *${BANNER_ACTUAL.destacado.nombre}*`,
      `║ 📺 ${BANNER_ACTUAL.destacado.origen}`,
      `║ 📈 *+${BANNER_ACTUAL.rateUp}% de probabilidad*`,
      `║`,
      `╠══〔 🎲 *PROBABILIDADES* 〕══════════╣`,
      `║`,
      lista,
      `║`,
      `║ 💡 Usa *${usedPrefix}gacha* para tirar`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🎪')
}

handler.help    = ['banner']
handler.tags    = ['gacha']
handler.command = ['banner', 'banners']
handler.register = true
handler.desc    = 'Muestra el banner actual del gacha'

export default handler
