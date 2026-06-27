const handler = async (m, { conn, args, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply([
      `╔══〔 ✏️ *THEELY-MD — SETNAME* 〕══╗`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ ${usedPrefix + command} <nuevo nombre>`,
      `║`,
      `║ 📌 *Ejemplo:*`,
      `║ ➤ ${usedPrefix + command} Mi Grupo TheEly 🌼`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const nuevoNombre = args.join(' ')

  if (nuevoNombre.length > 25) {
    return m.reply([
      `╔══〔 ✏️ *THEELY-MD — SETNAME* 〕══╗`,
      `║`,
      `║ ❌ *Nombre muy largo~*`,
      `║ Máximo: *25 caracteres*`,
      `║ Tienes: *${nuevoNombre.length}*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  try {
    await conn.groupUpdateSubject(m.chat, nuevoNombre)

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 ✏️ *THEELY-MD — SETNAME* 〕══╗`,
        `║`,
        `║ ✅ *¡Nombre del grupo actualizado!*`,
        `║`,
        `║ 📋 *Nuevo nombre:*`,
        `║ ${nuevoNombre}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('❌ Error al actualizar el nombre del grupo:', e.message)
    await m.react('❌')
    m.reply([
      `╔══〔 ✏️ *THEELY-MD — SETNAME* 〕══╗`,
      `║`,
      `║ ❌ *No se pudo cambiar el nombre~*`,
      `║`,
      `║ 💡 *Posibles causas:*`,
      `║ ➤ El bot perdió permisos de admin`,
      `║ ➤ Nombre con caracteres no válidos`,
      `║`,
      `║ 🔄 Intenta de nuevo~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help     = ['setname <nombre>']
handler.tags     = ['grupo']
handler.command  = /^(setname|newnombre|nuevonombre)$/i
handler.group    = true
handler.admin    = true
handler.botAdmin = true
handler.desc     = 'Cambia el nombre del grupo'

export default handler
