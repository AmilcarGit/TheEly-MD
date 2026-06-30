import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PERSONAJES = JSON.parse(fs.readFileSync(path.join(__dirname, 'lib', 'gacha-personajes.json'), 'utf-8'))

const RAREZAS = {
  comun: { nombre: 'Común', emoji: '⚪' },
  raro: { nombre: 'Raro', emoji: '🔵' },
  epico: { nombre: 'Épico', emoji: '🟣' },
  legendario: { nombre: 'Legendario', emoji: '🟡' },
  mitico: { nombre: 'Mítico', emoji: '🔴' },
  ely_especial: { nombre: 'Ely Especial', emoji: '🌼' },
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — BUSCAR* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <nombre>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} Goku`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const busqueda = text.trim().toLowerCase()
  const resultados = []

  for (const [rareza, lista] of Object.entries(PERSONAJES)) {
    for (const p of lista) {
      if (p.nombre.toLowerCase().includes(busqueda)) {
        resultados.push({ ...p, rareza })
      }
    }
  }

  if (!resultados.length) return m.reply([
    `╔══〔 🌼 *THEELY-MD — BUSCAR* 〕══╗`,
    `║`,
    `║ ❌ *No se encontró ningún*`,
    `║ *personaje con ese nombre~*`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const lista = resultados.slice(0, 10).map(p => {
    const r = RAREZAS[p.rareza]
    return `║ ${p.emoji} *${p.nombre}*\n║    📺 ${p.origen}\n║    ${r.emoji} ${r.nombre}`
  }).join('\n║\n')

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — BUSCAR* 〕══╗`,
      `║`,
      `║ 🔍 *${resultados.length} resultado(s) para:*`,
      `║ "${text.trim()}"`,
      `║`,
      lista,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🔍')
}

handler.help    = ['buscarpersonaje <nombre>']
handler.tags    = ['gacha']
handler.command = ['buscarpersonaje', 'searchchar', 'infogacha']
handler.register = true
handler.desc    = 'Busca info de un personaje del gacha'
export default handler
