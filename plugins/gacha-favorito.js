const RAREZAS_EMOJI = {
  comun: '⚪', raro: '🔵', epico: '🟣', legendario: '🟡', mitico: '🔴', ely_especial: '🌼'
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]

  if (!text) {
    const fav = user.favorito

    if (!fav) return m.reply([
      `╔══〔 🌼 *THEELY-MD — FAVORITO* 〕══╗`,
      `║`,
      `║ ⭐ *Aún no tienes favorito~*`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ ${usedPrefix + command} <nombre del personaje>`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))

    return m.reply([
      `╔══〔 🌼 *THEELY-MD — FAVORITO* 〕══╗`,
      `║`,
      `║ ⭐ *Tu personaje favorito:*`,
      `║`,
      `║ ${RAREZAS_EMOJI[fav.rareza]} *${fav.nombre}*`,
      `║ 📺 ${fav.origen}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const coleccion = user.coleccion || []
  const encontrado = coleccion.find(c =>
    c.nombre.toLowerCase().includes(text.trim().toLowerCase())
  )

  if (!encontrado) return m.reply([
    `╔══〔 🌼 *THEELY-MD — FAVORITO* 〕══╗`,
    `║`,
    `║ ❌ *No tienes ese personaje~*`,
    `║ Usa *.coleccion* para ver lo que`,
    `║ tienes~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  global.db.data.users[m.sender].favorito = encontrado
  await global.db.write()

  await m.react('⭐')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — FAVORITO* 〕══╗`,
    `║`,
    `║ ✅ *¡Favorito actualizado!*`,
    `║`,
    `║ ${RAREZAS_EMOJI[encontrado.rareza]} *${encontrado.nombre}*`,
    `║ 📺 ${encontrado.origen}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help     = ['favorito [nombre]']
handler.tags     = ['gacha']
handler.command  = ['favorito', 'fav', 'main']
handler.register = true
handler.desc     = 'Marca o ve tu personaje favorito'
export default handler
