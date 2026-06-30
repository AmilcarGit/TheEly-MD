import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — TRADUCIR* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <idioma> <texto>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} en Hola mundo`,
    `║ ${usedPrefix + command} fr Buenos días`,
    `║`,
    `║ 💡 *Códigos comunes:*`,
    `║ en=Inglés fr=Francés de=Alemán`,
    `║ pt=Portugués it=Italiano ja=Japonés`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const args  = text.trim().split(' ')
  const idioma = args[0].toLowerCase()
  const texto  = args.slice(1).join(' ')

  if (!texto) return m.reply(`❌ Especifica el texto a traducir~`)

  await m.react('🌐')

  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${idioma}&dt=t&q=${encodeURIComponent(texto)}`)
    const json = await res.json()

    if (!json || !json[0]) throw new Error('No se pudo traducir')

    const traduccion = json[0].map(t => t[0]).join('')
    const idiomaDetectado = json[2] || 'auto'

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — TRADUCIR* 〕══╗`,
        `║`,
        `║ 🔤 *Original* (${idiomaDetectado}):`,
        `║ ${texto}`,
        `║`,
        `║ 🌐 *Traducción* (${idioma}):`,
        `║ ${traduccion}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — TRADUCIR* 〕══╗`,
      `║`,
      `║ ❌ *Error al traducir~*`,
      `║ Verifica el código de idioma`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help    = ['traducir <idioma> <texto>']
handler.tags    = ['tools']
handler.command = ['traducir', 'translate', 'tr']
handler.desc    = 'Traduce texto a otro idioma'

export default handler
