const ACCIONES = {
  abrazar:  { emoji: '🤗', msg: (a, b) => `*${a}* le da un abrazo cálido a *${b}* 🤗` },
  besar:    { emoji: '😘', msg: (a, b) => `*${a}* le da un besito a *${b}* 😘` },
  golpear:  { emoji: '👊', msg: (a, b) => `*${a}* le da un golpe a *${b}* 👊` },
  patear:   { emoji: '🦵', msg: (a, b) => `*${a}* le lanza una patada a *${b}* 🦵` },
  saludar:  { emoji: '👋', msg: (a, b) => `*${a}* saluda a *${b}* con una sonrisa 👋` },
  matar:    { emoji: '💀', msg: (a, b) => `*${a}* elimina a *${b}* del mapa 💀` },
  acariciar:{ emoji: '🥰', msg: (a, b) => `*${a}* acaricia suavemente a *${b}* 🥰` },
  bailar:   { emoji: '💃', msg: (a, b) => `*${a}* invita a *${b}* a bailar 💃` },
  morder:   { emoji: '😈', msg: (a, b) => `*${a}* muerde a *${b}* 😈` },
  ignorar:  { emoji: '😒', msg: (a, b) => `*${a}* ignora completamente a *${b}* 😒` },
  cuidar:   { emoji: '💕', msg: (a, b) => `*${a}* cuida con amor a *${b}* 💕` },
  retar:    { emoji: '⚔️',  msg: (a, b) => `*${a}* desafía a *${b}* a un duelo ⚔️` },
}

const handler = async (m, { conn, command, usedPrefix }) => {
  const accion = ACCIONES[command]
  if (!accion) return

  const quien = m.mentionedJid?.[0] || m.quoted?.sender

  if (!quien) return m.reply([
    `╔══〔 🌼 *THEELY-MD — ROLEPLAY* 〕══╗`,
    `║`,
    `║ 💡 *Uso:* ${usedPrefix + command} @usuario`,
    `║ O responde a un mensaje~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const user1 = global.db.data.users[m.sender]
  const user2 = global.db.data.users[quien]
  const nombre1 = user1?.name || m.pushName || m.sender.split('@')[0]
  const nombre2 = user2?.name || quien.split('@')[0]

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — ROLEPLAY* 〕══╗`,
      `║`,
      `║ ${accion.emoji} ${accion.msg(nombre1, nombre2)}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'),
    mentions: [m.sender, quien]
  }, { quoted: m })

  await m.react(accion.emoji)
}

handler.help    = ['abrazar/besar/golpear @usuario']
handler.tags    = ['fun']
handler.command = Object.keys(ACCIONES)
handler.desc    = 'Acciones de roleplay con otros usuarios'
export default handler
