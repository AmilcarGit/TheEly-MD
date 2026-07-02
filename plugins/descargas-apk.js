import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — APK* 〕══╗`,
      `║`,
      `║ 📥 *Busca aplicaciones Android*`,
      `║`,
      `║ 💡 *Ejemplos:*`,
      `║ ➤ .apk Minecraft`,
      `║ ➤ .apk WhatsApp Plus`,
      `║ ➤ .apk Spotify`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🔎')

  try {
    const api = `https://api.delirius.store/download/apk?query=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.data) {
      await m.react('❌')
      return conn.sendMessage(m.chat, {
        text: [
          `╔══〔 🌼 *THEELY-MD — APK* 〕══╗`,
          `║`,
          `║ ❌ Sin resultados para:`,
          `║ 🔍 *${text}*`,
          `║`,
          `║ 💡 Intenta con otro nombre~`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
    }

    const { name, size, image, download, developer, stats, publish } = json.data

    if (!download) {
      await m.react('❌')
      return conn.sendMessage(m.chat, {
        text: [
          `╔══〔 🌼 *THEELY-MD — APK* 〕══╗`,
          `║`,
          `║ ⚠️ APK encontrado pero sin`,
          `║ enlace de descarga disponible~`,
          `║`,
          `║ 📦 *${name}*`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n')
      }, { quoted: m })
    }

    const caption = [
      `╔══〔 🌼 *THEELY-MD — APK* 〕══╗`,
      `║`,
      `║ 📦 *Nombre:*      ${name}`,
      `║ 👤 *Developer:*   ${developer || 'Desconocido'}`,
      `║ 📂 *Tamaño:*      ${size || 'N/A'}`,
      `║ 📅 *Publicado:*   ${publish || 'N/A'}`,
      `║ ⬇️  *Descargas:*  ${stats?.downloads?.toLocaleString() || 'N/A'}`,
      `║ ⭐ *Rating:*      ${stats?.rating?.average || 'N/A'}`,
      `║`,
      `║ ⏳ *Enviando archivo...*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    await conn.sendMessage(m.chat, {
      image: { url: image || 'https://files.catbox.moe/r60c8l.jpg' },
      caption
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      document: { url: download },
      fileName: `${name}.apk`,
      mimetype: 'application/vnd.android.package-archive',
      caption: `✅ *${name}* — Descargado con *TheEly-MD 🌼*`
    }, { quoted: m })

    await m.react('✅')

  } catch (err) {
    console.error('❌ Error en APK:', err.message)
    await m.react('❌')
    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — APK* 〕══╗`,
        `║`,
        `║ ❌ *Error al buscar el APK~*`,
        `║ 🔄 Inténtalo nuevamente`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })
  }
}

handler.help    = ['apk <nombre>']
handler.tags    = ['descargas']
handler.command = /^(apk|apkdl|descargarapk)$/i
handler.desc    = 'Busca y descarga APKs de Android'

export default handler
