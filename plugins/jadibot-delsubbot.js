import { existsSync, rmSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, args, isROwner }) => {
  const nombreBot = global.namebot || 'TheEly-MD'

  let numero = (args[0] || '').replace(/\D/g, '')
    || m.mentionedJid?.[0]?.split('@')[0]
    || m.quoted?.sender?.split('@')[0]

  if (!numero) {
    return conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot}* 〕══╗`,
      `║`,
      `║ 💡 *Uso:*`,
      `║ .delsubbot <número>`,
      `║ O menciona/responde al sub-bot~`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }

  const targetJid = `${numero}@s.whatsapp.net`
  const esPropio = m.sender.split('@')[0] === numero

  if (!isROwner && !esPropio) {
    return conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot}* 〕══╗`,
      `║`,
      `║ 🔐 *Sin permiso~*`,
      `║ Solo el creador del bot`,
      `║ o el dueño del sub-bot`,
      `║ puede eliminarlo~`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }

  if (!global.conns || !Array.isArray(global.conns)) global.conns = []
  const target = global.conns.find(c => c.user?.jid === targetJid)

  if (target) {
    try { target.ev?.removeAllListeners() } catch {}
    try { target.ws?.close?.() } catch {}
    global.conns = global.conns.filter(c => c.user?.jid !== targetJid)
  }

  const carpeta = join(process.cwd(), `./${global.jadi}`, numero)
  let carpetaEliminada = false
  if (existsSync(carpeta)) {
    try {
      rmSync(carpeta, { recursive: true, force: true })
      carpetaEliminada = true
    } catch (e) {
      console.error('❌ Error eliminando sesión de sub-bot:', e)
    }
  }

  if (!target && !carpetaEliminada) {
    return conn.reply(m.chat, [
      `╔══〔 🌼 *${nombreBot}* 〕══╗`,
      `║`,
      `║ ❌ *No encontrado~*`,
      `║ No hay ningún sub-bot`,
      `║ con el número +${numero}~`,
      `║`,
      `╚══════════════════════╝`
    ].join('\n'), m)
  }

  await conn.reply(m.chat, [
    `╔══〔 🌼 *${nombreBot}* 〕══╗`,
    `║`,
    `║ ✅ *Sub-bot eliminado*`,
    `║ 📱 +${numero}`,
    `║`,
    target ? `║ 🔌 Desconectado de la red~` : `║ 🗂️ No estaba activo en memoria~`,
    carpetaEliminada ? `║ 🧹 Sesión borrada del disco~` : `║ ⚠️ No había sesión en disco~`,
    `║`,
    `╚══════════════════════╝`
  ].join('\n'), m)

  await m.react('🧹')
}

handler.command = ['delsubbot', 'delsub', 'eliminarsubbot']
handler.help = ['delsubbot <número>']
handler.tags = ['jadibot']
handler.desc = 'Elimina y desconecta un sub-bot'

export default handler
