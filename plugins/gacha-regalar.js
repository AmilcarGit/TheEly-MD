const handler = async (m, { conn, text, usedPrefix, command }) => {
  const user   = global.db.data.users[m.sender]
  const quien  = m.mentionedJid?.[0] || m.quoted?.sender

  if (!quien) return m.reply([
    `╔══〔 🌼 *THEELY-MD — REGALAR* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} @usuario <nombre del personaje>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} @Ely Vegeta`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (quien === m.sender) return m.reply(`❌ No puedes regalarte un personaje a ti mismo~`)

  const partes = text.split(' ')
  const nombrePersonaje = partes.slice(1).join(' ').trim()

  if (!nombrePersonaje) return m.reply(`❌ Especifica el nombre del personaje a regalar~`)

  const coleccion = user.coleccion || []
  const indice = coleccion.findIndex(c =>
    c.nombre.toLowerCase().includes(nombrePersonaje.toLowerCase())
  )

  if (indice === -1) return m.reply([
    `╔══〔 🌼 *THEELY-MD — REGALAR* 〕══╗`,
    `║`,
    `║ ❌ *No tienes ese personaje~*`,
    `║ Usa *.coleccion* para ver lo que`,
    `║ tienes~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const personajeRegalado = coleccion[indice]

  if (!global.db.data.users[quien]) {
    return m.reply(`❌ Ese usuario no está registrado~`)
  }

  // ── Transferir ──
  global.db.data.users[m.sender].coleccion.splice(indice, 1)
  if (!global.db.data.users[quien].coleccion) global.db.data.users[quien].coleccion = []
  global.db.data.users[quien].coleccion.push({ ...personajeRegalado, fecha: Date.now() })

  await global.db.write()

  const RAREZAS_EMOJI = {
    comun: '⚪', raro: '🔵', epico: '🟣', legendario: '🟡', mitico: '🔴', ely_especial: '🌼'
  }

  await m.react('🎁')
  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — REGALAR* 〕══╗`,
      `║`,
      `║ 🎁 *¡Regalo enviado!*`,
      `║`,
      `║ 📤 *De:* @${m.sender.split('@')[0]}`,
      `║ 📥 *Para:* @${quien.split('@')[0]}`,
      `║`,
      `║ ${RAREZAS_EMOJI[personajeRegalado.rareza]} *${personajeRegalado.nombre}*`,
      `║ 📺 ${personajeRegalado.origen}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'),
    mentions: [m.sender, quien]
  }, { quoted: m })
}

handler.help     = ['regalar @usuario <personaje>']
handler.tags     = ['gacha']
handler.command  = ['regalar', 'gift', 'dar']
handler.register = true
handler.desc     = 'Regala un personaje de tu colección'
export default handler
