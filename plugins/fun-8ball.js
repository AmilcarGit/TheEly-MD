const RESPUESTAS = [
  '✅ Sí, definitivamente~',
  '✅ Todo indica que sí~',
  '✅ Sin duda alguna~',
  '✅ Puedes contar con ello~',
  '✅ Las señales dicen que sí~',
  '🤔 Es incierto por ahora~',
  '🤔 Pregunta de nuevo más tarde~',
  '🤔 No puedo predecirlo ahora~',
  '🤔 Mejor no te digo~',
  '❌ No cuentes con eso~',
  '❌ Mi respuesta es no~',
  '❌ Las señales dicen que no~',
  '❌ Definitivamente no~',
  '❌ Muy dudoso~'
]

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — 8BALL* 〕══╗`,
    `║`,
    `║ 🔮 *Uso:* ${usedPrefix + command} <pregunta>`,
    `║ 📌 Ejemplo: *.8ball ¿Seré rico?*`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const respuesta = RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)]

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — 8BALL* 〕══╗`,
      `║`,
      `║ 🔮 *Pregunta:*`,
      `║ ${text}`,
      `║`,
      `║ 🎱 *Respuesta:*`,
      `║ ${respuesta}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🔮')
}

handler.help    = ['8ball <pregunta>']
handler.tags    = ['fun']
handler.command = ['8ball', 'bola', 'magia']
handler.desc    = 'Pregunta a la bola mágica'
export default handler
