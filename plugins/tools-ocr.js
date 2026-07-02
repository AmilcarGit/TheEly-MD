import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'

const handler = async (m, { conn }) => {
  const q    = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) return conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — OCR* 〕══╗`,
      `║`,
      `║ 📝 *Extrae texto de imágenes*`,
      `║`,
      `║ 💡 Responde a una imagen con`,
      `║ el comando *.ocr*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🔍')

  try {
    const media = await q.download()
    if (!media) throw new Error('No se pudo descargar la imagen')

    const tmp = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true })

    const tmpFile = path.join(tmp, `ocr_${Date.now()}.jpg`)
    fs.writeFileSync(tmpFile, media)

    const form = new FormData()
    form.append('apikey', 'K82360283488957')
    form.append('language', 'spa')
    form.append('isOverlayRequired', 'false')
    form.append('file', fs.createReadStream(tmpFile), 'image.jpg')

    const res  = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: form })
    const json = await res.json()

    fs.unlinkSync(tmpFile)

    const texto = json?.ParsedResults?.[0]?.ParsedText?.trim()

    if (!texto) throw new Error('No se detectó texto en la imagen')

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — OCR* 〕══╗`,
        `║`,
        `║ 📝 *Texto detectado:*`,
        `║`,
        texto.split('\n').map(l => `║ ${l}`).join('\n'),
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — OCR* 〕══╗`,
        `║`,
        `║ ❌ *No se pudo leer la imagen~*`,
        `║ ${e.message.slice(0, 80)}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }
}

handler.help    = ['ocr']
handler.tags    = ['tools']
handler.command = ['ocr', 'leerImagen', 'readtext']
handler.desc    = 'Extrae texto de una imagen'
export default handler
