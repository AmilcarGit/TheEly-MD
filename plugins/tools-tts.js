import gTTS from 'node-gtts'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const nombreBot = global.namebot || 'TheEly-MD'

  if (!text || !text.trim()) {
    return conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot} — TTS* 〕══╗`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ ${usedPrefix + command} <texto>`,
      `║ ${usedPrefix + command} en <texto>  (idioma opcional)`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }

  const idiomasValidos = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'ko', 'ru']
  const partes = text.trim().split(' ')
  let idioma = 'es'
  let frase = text.trim()

  if (idiomasValidos.includes(partes[0]?.toLowerCase())) {
    idioma = partes[0].toLowerCase()
    frase = partes.slice(1).join(' ')
  }

  if (!frase) {
    return conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot} — TTS* 〕══╗`,
      `║`,
      `║ ⚠️ *Falta el texto a decir~*`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }

  if (frase.length > 200) {
    return conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot} — TTS* 〕══╗`,
      `║`,
      `║ ⚠️ *Texto muy largo~*`,
      `║ Máximo 200 caracteres~`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }

  await m.react('⏳')

  try {
    const gtts = gTTS(idioma)
    const stream = gtts.stream(frase)

    const buffer = await new Promise((resolve, reject) => {
      const chunks = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', reject)
    })

    if (!buffer.length) throw new Error('Audio vacío')

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('❌ Error en tts:', e)
    await m.react('❌')
    await conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot} — TTS* 〕══╗`,
      `║`,
      `║ ❌ *Error al generar el audio~*`,
      `║ Verifica el idioma o intenta`,
      `║ con un texto más corto~`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }
}

handler.command = ['tts', 'texttospeech', 'decir']
handler.help = ['tts <texto>']
handler.tags = ['tools']
handler.desc = 'Convierte texto en un audio de voz'

export default handler
