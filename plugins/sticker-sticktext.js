import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fluent_ffmpeg from 'fluent-ffmpeg'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'
import Jimp from 'jimp'

const tmp = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true })

async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': categories,
    ...extra
  }
  const exifAttr = Buffer.from([
    0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,0x00,0x00
  ])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

async function imagenAWebp(img, packname, author) {
  const type = await fileTypeFromBuffer(img) || { mime: 'image/png', ext: 'png' }

  const tmpFile = path.join(tmp, `${Date.now()}.${type.ext}`)
  const outFile = `${tmpFile}.webp`
  await fs.promises.writeFile(tmpFile, img)

  await new Promise((resolve, reject) => {
    fluent_ffmpeg(tmpFile)
      .input(tmpFile)
      .addOutputOptions([
        `-vcodec`, `libwebp`, `-vf`,
        `scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=15, pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
      ])
      .toFormat('webp')
      .save(outFile)
      .on('error', reject)
      .on('end', resolve)
  })

  const buffer = await fs.promises.readFile(outFile)
  fs.promises.unlink(tmpFile).catch(() => {})
  fs.promises.unlink(outFile).catch(() => {})

  return await addExif(buffer, packname, author)
}

const handler = async (m, { conn, text }) => {
  const nombreBot = global.namebot || 'TheEly-MD'
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) {
    return conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *${nombreBot} — STICKTEXT* 〕══╗`,
        `║`,
        `║ ❌ Responde a una *imagen* con`,
        `║ este comando para ponerle texto~`,
        `║`,
        `║ 💡 *Uso:*`,
        `║ .sticktext texto arriba|texto abajo`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }

  if (!text || !text.trim()) {
    return conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *${nombreBot} — STICKTEXT* 〕══╗`,
        `║`,
        `║ 💡 *Uso:*`,
        `║ .sticktext texto arriba|texto abajo`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }

  const [arriba, abajo] = text.split('|').map(t => t?.trim().toUpperCase())

  await m.react('⏳')

  try {
    const media = await q.download()
    if (!media) throw new Error('No se pudo descargar la imagen')

    const size = 512
    const imagen = await Jimp.read(media)
    imagen.contain(size, size)

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)

    if (arriba) {
      imagen.print(font, 0, 10, {
        text: arriba,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      }, size, 80)
    }
    if (abajo) {
      imagen.print(font, 0, size - 90, {
        text: abajo,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      }, size, 80)
    }

    const bufferConTexto = await imagen.getBufferAsync(Jimp.MIME_PNG)

    const packname = global.packname || '🌼 THEELY-MD Stickers'
    const author   = global.author   || '© AmilcarGit | 2026'

    const stiker = await imagenAWebp(bufferConTexto, packname, author)

    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error('❌ Error en sticktext:', e)
    await m.react('❌')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *${nombreBot} — STICKTEXT* 〕══╗`,
        `║`,
        `║ ❌ *Error al crear el sticker~*`,
        `║ Intenta con otra imagen~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }
}

handler.help    = ['sticktext <arriba>|<abajo>']
handler.tags    = ['sticker']
handler.command = ['sticktext', 'stickertext', 'memesticker']
handler.desc    = 'Crea un sticker con texto estilo meme desde una imagen'

export default handler
