import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'

const API_BASE = 'https://dv-yer-api.online/mediafire'
const API_KEY = 'dvyer506422062605'
const MAX_TAMANO_DIRECTO = 200 * 1024 * 1024 // 200 MB

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply([
      `╔══〔 📂 *THEELY-MD — MEDIAFIRE* 〕══╗`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ ${usedPrefix + command} <enlace de MediaFire>`,
      `║`,
      `║ 📌 *Ejemplos:*`,
      `║ ➤ ${usedPrefix + command} mediafire.com/file/abc123/archivo.zip`,
      `║ ➤ ${usedPrefix + command} www.mediafire.com/file/...`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const url = text.trim()

  if (!url.includes('mediafire.com')) {
    return m.reply([
      `╔══〔 📂 *THEELY-MD — MEDIAFIRE* 〕══╗`,
      `║`,
      `║ ❌ *Enlace inválido~*`,
      `║ Solo se aceptan enlaces de MediaFire`,
      `║`,
      `║ 💡 Ejemplo: mediafire.com/file/...`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  await m.react('📂')

  try {
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 📂 *THEELY-MD — MEDIAFIRE* 〕══╗`,
        `║`,
        `║ ⏳ *Procesando enlace...*`,
        `║ 💡 Espera un momento~`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    const apiUrl = `${API_BASE}?mode=link&url=${encodeURIComponent(url)}&apikey=${API_KEY}`

    const res = await Promise.race([
      fetch(apiUrl, {
        headers: { 'accept': 'application/json', 'user-agent': 'TheEly-MD' }
      }),
      new Promise((_, rej) => setTimeout(() => rej('timeout'), 15000))
    ])

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    const data = await res.json()

    if (!data.ok || !data.download_url) {
      throw new Error(data.error || 'No se pudo obtener información del archivo')
    }

    const nombre = data.filename || data.title || 'Archivo'
    const tamanoTexto = data.filesize || 'Desconocido'
    const extension = data.extension || path.extname(nombre).slice(1) || 'bin'
    const tipo = data.format || 'Archivo'
    const enlaceDescarga = data.download_url

    // Parsear tamaño a bytes
    let tamanoBytes = 0
    if (typeof tamanoTexto === 'string') {
      const match = tamanoTexto.match(/^([\d.]+)\s*(KB|MB|GB|B)$/i)
      if (match) {
        const num = parseFloat(match[1])
        const unit = match[2].toUpperCase()
        if (unit === 'B') tamanoBytes = num
        else if (unit === 'KB') tamanoBytes = num * 1024
        else if (unit === 'MB') tamanoBytes = num * 1024 * 1024
        else if (unit === 'GB') tamanoBytes = num * 1024 * 1024 * 1024
      } else {
        const clean = tamanoTexto.replace(/\s/g, '')
        const numMatch = clean.match(/^([\d.]+)/)
        if (numMatch) {
          const num = parseFloat(numMatch[1])
          if (clean.includes('GB')) tamanoBytes = num * 1024 * 1024 * 1024
          else if (clean.includes('MB')) tamanoBytes = num * 1024 * 1024
          else if (clean.includes('KB')) tamanoBytes = num * 1024
          else tamanoBytes = num
        }
      }
    }

    if (tamanoBytes > MAX_TAMANO_DIRECTO) {
      await conn.sendMessage(m.chat, {
        text: [
          `╔══〔 📂 *THEELY-MD — MEDIAFIRE* 〕══╗`,
          `║`,
          `║ ✅ *Archivo encontrado*`,
          `║`,
          `║ 📄 *Nombre:* ${nombre.slice(0, 50)}`,
          `║ 📦 *Tamaño:* ${tamanoTexto}`,
          `║ 🗂️ *Tipo:* ${tipo}`,
          `║`,
          `║ ⚠️ *Excede el límite de envío directo*`,
          `║ 📥 *Descarga aquí:*`,
          `║ ${enlaceDescarga}`,
          `║`,
          `║ 💫 *Powered by TheEly-MD 🌼*`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
      await m.react('✅')
      return
    }

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 📂 *THEELY-MD — MEDIAFIRE* 〕══╗`,
        `║`,
        `║ ⬇️ *Descargando archivo...*`,
        `║ 📄 ${nombre.slice(0, 40)}`,
        `║ 📦 ${tamanoTexto}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const filePath = path.join(tmpDir, `mf_${Date.now()}.${extension}`)

    const fileRes = await Promise.race([
      fetch(enlaceDescarga, {
        headers: { 'user-agent': 'TheEly-MD' }
      }),
      new Promise((_, rej) => setTimeout(() => rej('timeout'), 30000))
    ])

    if (!fileRes.ok) {
      throw new Error(`Error al descargar: ${fileRes.status}`)
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    // Detectar tipo MIME real
    let mimeType = 'application/octet-stream'
    let tipoArchivoEnvio = 'document'
    try {
      const fileType = await fileTypeFromBuffer(buffer)
      if (fileType) {
        mimeType = fileType.mime
        if (mimeType.startsWith('image/')) tipoArchivoEnvio = 'image'
        else if (mimeType.startsWith('video/')) tipoArchivoEnvio = 'video'
        else if (mimeType.startsWith('audio/')) tipoArchivoEnvio = 'audio'
        else tipoArchivoEnvio = 'document'
      }
    } catch (e) {}

    const msg = {
      [tipoArchivoEnvio]: buffer,
      mimetype: mimeType,
      fileName: nombre,
      caption: [
        `╔══〔 📂 *THEELY-MD — MEDIAFIRE* 〕══╗`,
        `║`,
        `║ ✅ *Descargado correctamente*`,
        `║`,
        `║ 📄 *Nombre:* ${nombre.slice(0, 50)}`,
        `║ 📦 *Tamaño:* ${tamanoTexto}`,
        `║ 🗂️ *Tipo:* ${tipo}`,
        `║`,
        `║ 💫 *Powered by TheEly-MD 🌼*`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }

    await conn.sendMessage(m.chat, msg, { quoted: m })

    try { fs.unlinkSync(filePath) } catch {}

    await m.react('✅')

  } catch (e) {
    console.error('❌ Error MediaFire DL:', e.message)
    await m.react('❌')
    m.reply([
      `╔══〔 📂 *THEELY-MD — MEDIAFIRE* 〕══╗`,
      `║`,
      `║ ❌ *No se pudo procesar el archivo~*`,
      `║`,
      `║ 💡 Posibles causas:`,
      `║ ➤ Enlace inválido o privado`,
      `║ ➤ Archivo eliminado o caducado`,
      `║ ➤ Servicio temporalmente fuera de línea`,
      `║`,
      `║ 🔄 Intenta con otro enlace`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.command = ['mediafire', 'mf', 'mfdl']
handler.help    = ['mf <enlace>']
handler.tags    = ['descargas']
handler.desc    = 'Descarga archivos desde MediaFire'
handler.register = false
handler.limit = false

export default handler