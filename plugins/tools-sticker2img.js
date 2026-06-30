import webp from 'node-webpmux'
import fs from 'fs'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'

const tmp = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true })

const handler = async (m, { conn }) => {
  const q    = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/webp/.test(mime)) return conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — STICKER2IMG* 〕══╗`,
      `║`,
      `║ ❌ Responde a un *sticker* con`,
      `║ este comando para convertirlo`,
      `║ en imagen~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('⏳')

  try {
    const media = await q.download()
    if (!media) throw new Error('No se pudo descargar el sticker')

    const animado = await isAnimated(media)

    if (animado) {
      // Sticker animado → enviar como gif/mp4
      await conn.sendMessage(m.chat, {
        video: media,
        gifPlayback: true,
        caption: [
          `╔══〔 🌼 *THEELY-MD — STICKER2IMG* 〕══╗`,
          `║`,
          `║ ✅ *Sticker animado convertido!*`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
    } else {
      // Sticker estático → convertir a PNG
      const tmpFile = path.join(tmp, `${Date.now()}.webp`)
      await fs.promises.writeFile(tmpFile, media)

      const img = new webp.Image()
      await img.load(tmpFile)

      const outFile = path.join(tmp, `${Date.now()}.png`)
      await img.save(outFile)

      const buffer = await fs.promises.readFile(outFile)

      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: [
          `╔══〔 🌼 *THEELY-MD — STICKER2IMG* 〕══╗`,
          `║`,
          `║ ✅ *¡Convertido a imagen!*`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })

      fs.unlinkSync(tmpFile)
      fs.unlinkSync(outFile)
    }

    await m.react('✅')

  } catch (e) {
    console.error('❌ Error sticker2img:', e)
    await m.react('❌')
    conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — STICKER2IMG* 〕══╗`,
        `║`,
        `║ ❌ *Error al convertir~*`,
        `║ Intenta con otro sticker`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }
}

async function isAnimated(buffer) {
  try {
    const img = new webp.Image()
    const tmpCheck = path.join(tmp, `check_${Date.now()}.webp`)
    await fs.promises.writeFile(tmpCheck, buffer)
    await img.load(tmpCheck)
    fs.unlinkSync(tmpCheck)
    return img.frameCount > 1
  } catch {
    return false
  }
}

handler.help    = ['sticker2img']
handler.tags    = ['tools']
handler.command = ['sticker2img', 'toimg', 's2i']
handler.desc    = 'Convierte un sticker en imagen'

export default handler
