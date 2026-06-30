import { evaluate } from 'mathjs'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — CALCULAR* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <operación>`,
    `║`,
    `║ 📌 *Ejemplos:*`,
    `║ ${usedPrefix + command} 5+5*2`,
    `║ ${usedPrefix + command} sqrt(81)`,
    `║ ${usedPrefix + command} 2^10`,
    `║ ${usedPrefix + command} sin(45 deg)`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  try {
    const resultado = evaluate(text.trim())

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — CALCULAR* 〕══╗`,
        `║`,
        `║ 📝 *Operación:*`,
        `║ ${text.trim()}`,
        `║`,
        `║ 🧮 *Resultado:*`,
        `║ ${resultado}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('🧮')

  } catch (e) {
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — CALCULAR* 〕══╗`,
      `║`,
      `║ ❌ *Operación inválida~*`,
      `║ Verifica la sintaxis matemática`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help    = ['calcular <operación>']
handler.tags    = ['tools']
handler.command = ['calcular', 'calc', 'math']
handler.desc    = 'Calculadora matemática'

export default handler
