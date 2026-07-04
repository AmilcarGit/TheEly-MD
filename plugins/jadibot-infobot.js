import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, args }) => {
  const nombreBot = global.namebot || 'TheEly-MD'

  let numero = (args[0] || '').replace(/\D/g, '')
    || m.mentionedJid?.[0]?.split('@')[0]
    || m.quoted?.sender?.split('@')[0]
    || (m.fromMe ? conn.user?.jid?.split('@')[0] : m.sender.split('@')[0])

  const targetJid = `${numero}@s.whatsapp.net`

  if (!global.conns || !Array.isArray(global.conns)) global.conns = []
  const target = global.conns.find(c => c.user?.jid === targetJid)

  const esPrincipal = global.conn?.user?.jid === targetJid
  const conectado = !!(target?.user && target?.ws?.socket?.readyState === 1)

  let tiempoConectado = 'sin registrar'
  if (target && typeof target.connectedAt === 'number' && target.connectedAt > 0) {
    tiempoConectado = clockString(Date.now() - target.connectedAt)
  }

  const carpeta = join(process.cwd(), `./${global.jadi}`, numero)
  const existeSesion = existsSync(carpeta)
  const existeCreds = existsSync(join(carpeta, 'creds.json'))

  let nombrePersonalizado = null
  const configPath = join(carpeta, 'config.json')
  if (existsSync(configPath)) {
    try {
      const cfg = JSON.parse(readFileSync(configPath, 'utf-8'))
      if (cfg.name) nombrePersonalizado = cfg.name
    } catch {}
  }

  let nombre = target?.user?.name || nombrePersonalizado
  if (!nombre && typeof conn.getName === 'function') {
    try { nombre = await conn.getName(targetJid) } catch {}
  }

  const texto = [
    `╔══〔 🌼 *${nombreBot} — INFO BOT* 〕══╗`,
    `║`,
    `║ 👤 *Nombre:* ${nombre || `+${numero}`}`,
    `║ 📱 *Número:* +${numero}`,
    `║ 🏷️ *Tipo:* ${esPrincipal ? 'Bot Principal' : 'Sub-Bot'}`,
    `║ 🔌 *Estado:* ${conectado ? '🟢 Conectado' : '🔴 Desconectado'}`,
    `║ ⏱️ *Tiempo conectado:* ${tiempoConectado}`,
    `║ 🗂️ *Sesión en disco:* ${existeSesion ? '✅ Sí' : '❌ No'}`,
    `║ 🔑 *Credenciales:* ${existeCreds ? '✅ Válidas' : '❌ No encontradas'}`,
    `║`,
    `║ 🔗 wa.me/${numero}`,
    `║`,
    `╚══════════════════════╝`
  ].join('\n')

  if (!existeSesion && !target) {
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

  await conn.reply(m.chat, texto, m)
  await m.react('📊')
}

handler.command = ['infobot', 'botinfo', 'subbotinfo']
handler.help = ['infobot <número>']
handler.tags = ['jadibot']
handler.desc = 'Muestra información detallada de un sub-bot'

export default handler

function clockString(ms) {
  if (ms <= 0) return 'recién conectado'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ')
}
