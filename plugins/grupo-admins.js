let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply([
    `╔══〔 🌼 *THEELY-MD* 〕══╗`,
    `║`,
    `║ ❌ Solo funciona en grupos~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const metadata = await conn.groupMetadata(m.chat).catch(() => null)
  if (!metadata) return m.reply('❌ No pude obtener info del grupo 🌼')

  const participants  = metadata.participants
  const groupName     = metadata.subject
  const totalMiembros = participants.length

  const creadores = participants.filter(p => p.admin === 'superadmin')
  const admins    = participants.filter(p => p.admin === 'admin')
  const botJid    = conn.user.jid.includes(':')
    ? conn.user.jid.split(':')[0] + '@s.whatsapp.net'
    : conn.user.jid

  const listaCreadores = creadores.map(p => {
    const num   = p.id.split('@')[0]
    const esBot = p.id === botJid ? ' 🤖' : ''
    const esTu  = p.id === m.sender ? ' ← Tú' : ''
    return `║ 👑 @${num}${esBot}${esTu}`
  }).join('\n')

  const listaAdmins = admins.map(p => {
    const num   = p.id.split('@')[0]
    const esBot = p.id === botJid ? ' 🤖' : ''
    const esTu  = p.id === m.sender ? ' ← Tú' : ''
    return `║ ⚔️ @${num}${esBot}${esTu}`
  }).join('\n')

  const totalAdmins = creadores.length + admins.length

  const txt = [
    `╔══〔 👑 *THEELY-MD — ADMINS* 〕══╗`,
    `║`,
    `║ 👥 *Grupo:*    ${groupName}`,
    `║ 👤 *Miembros:* ${totalMiembros}`,
    `║ 👑 *Admins:*   ${totalAdmins}`,
    `║ 🤖 *Bot admin:* ${isBotAdmin ? '✅ Sí' : '❌ No'}`,
    `║`,
    creadores.length > 0 ? [
      `╠══〔 👑 *CREADOR* 〕══════════════╣`,
      listaCreadores,
      `║`
    ].join('\n') : '',
    admins.length > 0 ? [
      `╠══〔 ⚔️ *ADMINISTRADORES* 〕══════╣`,
      listaAdmins,
      `║`
    ].join('\n') : '',
    totalAdmins === 0 ? `║ ❌ *Sin admins en el grupo~*\n║` : '',
    `║ 💫 *Powered by TheEly-MD 🌼*`,
    `╚══════════════════════════════════╝`
  ].filter(Boolean).join('\n')

  const mentions = [...creadores, ...admins].map(p => p.id)

  await conn.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
  await m.react('👑')
}

handler.help    = ['admins']
handler.tags    = ['grupo']
handler.command = /^(admins|admin|administradores)$/i
handler.group   = true
handler.desc    = 'Ver lista de admins del grupo'

export default handler
