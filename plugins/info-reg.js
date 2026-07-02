const handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]

  if (user?.registered) return m.reply([
    `╔══〔 🌼 *THEELY-MD — REGISTRO* 〕══╗`,
    `║`,
    `║ ✅ *Ya estás registrado~*`,
    `║`,
    `║ 👤 *Nombre:* ${user.name}`,
    `║ 🎂 *Edad:*   ${user.age} años`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — REGISTRO* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <nombre>.<edad>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} Amilcar.20`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const [nombre, edadStr] = text.trim().split('.')
  const edad = parseInt(edadStr)

  if (!nombre || isNaN(edad)) return m.reply([
    `╔══〔 🌼 *THEELY-MD — REGISTRO* 〕══╗`,
    `║`,
    `║ ❌ *Formato incorrecto~*`,
    `║`,
    `║ 💡 Usa: *${usedPrefix + command} Nombre.Edad*`,
    `║ 📌 Ejemplo: *${usedPrefix + command} Amilcar.20*`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (nombre.length < 2 || nombre.length > 25) return m.reply([
    `╔══〔 🌼 *THEELY-MD — REGISTRO* 〕══╗`,
    `║`,
    `║ ❌ *Nombre inválido~*`,
    `║ Debe tener entre 2 y 25 caracteres`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (edad < 5 || edad > 100) return m.reply([
    `╔══〔 🌼 *THEELY-MD — REGISTRO* 〕══╗`,
    `║`,
    `║ ❌ *Edad inválida~*`,
    `║ Debe estar entre 5 y 100 años`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  user.name       = nombre
  user.age        = edad
  user.registered = true
  user.regTime    = Date.now()

  await m.react('🌼')

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — BIENVENIDO/A* 〕══╗`,
      `║`,
      `║ ✅ *¡Registro exitoso!*`,
      `║`,
      `║ 👤 *Nombre:* ${nombre}`,
      `║ 🎂 *Edad:*   ${edad} años`,
      `║ 📱 *ID:*     @${m.sender.split('@')[0]}`,
      `║`,
      `║ 🌼 ¡Bienvenido/a a TheEly-MD!`,
      `║ Ya puedes usar todos los comandos~`,
      `║`,
      `║ 💡 Escribe el prefijo para ver`,
      `║ el menú completo~`,
      `║`,
      `╚════════════════════════════════════╝`
    ].join('\n'),
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help     = ['reg <nombre>.<edad>']
handler.tags     = ['info']
handler.command  = ['reg', 'register', 'registrar']
handler.register = false
handler.desc     = 'Registra tu perfil en TheEly-MD'

export default handler
