
import fetch from 'node-fetch'

const API = 'https://api.alyacore.xyz/ai/copilot'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — COPILOT* 〕══╗`,
      `║`,
      `║ 🤖 *Copilot IA~*`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ ${usedPrefix + command} <tu pregunta>`,
      `║`,
      `║ 📌 *Ejemplo:*`,
      `║ ${usedPrefix + command} ¿Qué es la IA?`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🤖')

  try {
    const res  = await fetch(`${API}?q=${encodeURIComponent(text.trim())}`)
    const data = await res.json()

    if (!data.status || !data.response) throw new Error('Sin respuesta de la IA')

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — COPILOT* 〕══╗`,
        `║`,
        data.response.trim(),
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('❌ Error en copilot:', e.message)
    await m.react('❌')
    conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — COPILOT* 〕══╗`,
        `║`,
        `║ ❌ *Error al conectar con la IA~*`,
        `║ 🔄 Intenta de nuevo`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }
}

handler.help    = ['copilot <pregunta>']
handler.tags    = ['ia']
handler.command = ['copilot', 'cp', 'bing']
handler.desc    = 'Chat con Copilot IA'

export default handler
