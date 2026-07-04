import ws from 'ws'

const handler = async (m, { conn }) => {
  if (!global.conns || !Array.isArray(global.conns)) global.conns = []

  const now = Date.now()
  const subBots = []
  const vistos = new Set()

  const connsOrdenados = [...global.conns]
    .filter(c => c.user && c.ws?.socket?.readyState === ws.OPEN)
    .sort((a, b) => (a.connectedAt || now) - (b.connectedAt || now))

  for (const connSub of connsOrdenados) {
    const jid = connSub.user.jid
    if (vistos.has(jid)) continue
    vistos.add(jid)

    const numero = jid?.split('@')[0]
    const esPrincipal = global.conn?.user?.jid === jid

    let nombre = connSub.user.name
    if (!nombre && typeof conn.getName === 'function') {
      try { nombre = await conn.getName(jid) } catch {}
    }

    let tiempoConectado = 0
    if (typeof connSub.connectedAt === 'number' && connSub.connectedAt > 0) {
      tiempoConectado = now - connSub.connectedAt
    }

    subBots.push({
      jid,
      nombre: nombre || `+${numero}`,
      numero,
      tiempoConectado,
      tieneTimestamp: typeof connSub.connectedAt === 'number' && connSub.connectedAt > 0,
      esPrincipal
    })
  }

  const totalUsers  = subBots.length
  const uptimeTotal = clockString(process.uptime() * 1000)
  const totalGrupos = Object.keys(global.db?.data?.chats || {}).filter(id => id.endsWith('@g.us')).length
  const totalUsuarios = Object.keys(global.db?.data?.users || {}).length

  const conTimestamp = subBots.filter(s => s.tieneTimestamp)
  const masAntiguo = conTimestamp[0]
  const tiempoPromedio = conTimestamp.length > 0
    ? conTimestamp.reduce((sum, s) => sum + s.tiempoConectado, 0) / conTimestamp.length
    : 0

  const nombreBot = global.namebot || 'TheEly-MD'
  const moneda = global.moneda || '🌼 ElyCoins'

  const lineas = [
    `╔══〔 🌼 *${nombreBot}* 〕══╗`,
    `║`,
    `║ 🤖 *Uptime del bot:* ${uptimeTotal}`,
    `║ 💫 *Sub-bots activos:* ${totalUsers}/${global.conns.length}`,
    `║ 👥 *Grupos:* ${totalGrupos}`,
    `║ 👤 *Usuarios:* ${totalUsuarios}`,
  ]

  if (conTimestamp.length > 0) {
    lineas.push(
      `║`,
      `║ ⏱️ *Promedio conectado:* ${clockString(tiempoPromedio)}`,
      `║ 🏆 *Más antiguo:* ${masAntiguo.nombre}`
    )
  }

  lineas.push(`║`, `╚══════════════════════╝`)

  if (totalUsers > 0) {
    lineas.push('')

    subBots.forEach((s, i) => {
      const medalla = s.esPrincipal ? '👑' :
        !s.tieneTimestamp ? '❓' :
        s.tiempoConectado > 7 * 86400000  ? '⭐' :
        s.tiempoConectado > 86400000      ? '🥇' :
        s.tiempoConectado > 3600000       ? '🥈' :
        s.tiempoConectado > 60000         ? '🥉' :
                                             '🆕'

      const uptimeTexto = s.tieneTimestamp
        ? clockString(s.tiempoConectado)
        : 'sin registrar'

      lineas.push(
        `╭─〔 ${medalla} *#${i + 1}* 〕`,
        `│ 👤 *Nombre:* ${s.nombre}`,
        `│ 📱 *Número:* +${s.numero}`,
        `│ 🏷️ *Tipo:* ${s.esPrincipal ? 'Bot Principal' : 'Sub-Bot'}`,
        `│ ⏱️ *Conectado hace:* ${uptimeTexto}`,
        `│ 🔗 wa.me/${s.numero}`,
        `╰━━━━━━━━━━━━━━╯`,
        ''
      )
    })

    lineas.push(`✨ _${moneda} · ${nombreBot} 🌼_`)
  } else {
    lineas.push(
      '',
      `╔══〔 🌼 *${nombreBot}* 〕══╗`,
      `║`,
      `║ ❌ *Sin sub-bots conectados~*`,
      `║ 💡 Usa *#qr* o *#code* para crear uno~`,
      `║`,
      `╚══════════════════════╝`
    )
  }

  await conn.reply(m.chat, lineas.join('\n').trim(), m)
  await m.react('🌼')
}

handler.command  = ['listjadibot', 'bots']
handler.help     = ['bots']
handler.tags     = ['jadibot']
handler.register = false
handler.desc     = 'Ver sub-bots conectados y su tiempo activo'

export default handler

function clockString(ms) {
  if (ms <= 0) return 'recién conectado'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ')
}
