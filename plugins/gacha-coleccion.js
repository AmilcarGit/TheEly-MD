const RAREZAS = {
  comun:        { nombre: 'Común',        emoji: '⚪', orden: 1 },
  raro:         { nombre: 'Raro',         emoji: '🔵', orden: 2 },
  epico:        { nombre: 'Épico',        emoji: '🟣', orden: 3 },
  legendario:   { nombre: 'Legendario',   emoji: '🟡', orden: 4 },
  mitico:       { nombre: 'Mítico',       emoji: '🔴', orden: 5 },
  ely_especial: { nombre: 'Ely Especial', emoji: '🌼', orden: 6 },
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const quien  = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const user   = global.db.data.users[quien]
  const esTuyo = quien === m.sender

  if (!user || !user.coleccion || user.coleccion.length === 0) return m.reply([
    `╔══〔 🌼 *THEELY-MD — COLECCIÓN* 〕══╗`,
    `║`,
    `║ 🎴 ${esTuyo ? 'Tu colección' : `Colección de @${quien.split('@')[0]}`}`,
    `║`,
    `║ 📭 *Vacía~*`,
    `║ Usa *.gacha* para tirar y conseguir`,
    `║ personajes~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'), null, { mentions: [quien] })

  const coleccion = user.coleccion

  // ── Agrupar por nombre, contar duplicados ──
  const agrupado = {}
  for (const item of coleccion) {
    const key = item.nombre
    if (!agrupado[key]) agrupado[key] = { ...item, cantidad: 0 }
    agrupado[key].cantidad++
  }

  const items = Object.values(agrupado).sort((a, b) =>
    RAREZAS[b.rareza].orden - RAREZAS[a.rareza].orden
  )

  const pagina    = parseInt(args[0]) || 1
  const porPagina = 10
  const totalPag  = Math.ceil(items.length / porPagina)
  const pagActual = Math.min(Math.max(pagina, 1), totalPag)
  const inicio    = (pagActual - 1) * porPagina
  const itemsPag  = items.slice(inicio, inicio + porPagina)

  const conteoRareza = {}
  for (const item of coleccion) {
    conteoRareza[item.rareza] = (conteoRareza[item.rareza] || 0) + 1
  }

  const resumenRarezas = Object.entries(RAREZAS)
    .filter(([key]) => conteoRareza[key])
    .map(([key, r]) => `${r.emoji}${conteoRareza[key]}`)
    .join(' ')

  const lista = itemsPag.map(item => {
    const r = RAREZAS[item.rareza]
    return `║ ${r.emoji} *${item.nombre}* x${item.cantidad}\n║    📺 ${item.origen}`
  }).join('\n║\n')

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — COLECCIÓN* 〕══╗`,
      `║`,
      `║ 🎴 ${esTuyo ? '*Tu colección*' : `*@${quien.split('@')[0]}*`}`,
      `║ 📦 *Total:* ${coleccion.length} | *Únicos:* ${items.length}`,
      `║ ${resumenRarezas}`,
      `║`,
      `╠══〔 📋 *PÁGINA ${pagActual}/${totalPag}* 〕══════╣`,
      `║`,
      lista,
      `║`,
      totalPag > 1 ? `║ 💡 *${usedPrefix + command} <página>* para navegar` : '',
      `║`,
      `╚══════════════════════════════════╝`
    ].filter(Boolean).join('\n'),
    mentions: [quien]
  }, { quoted: m })

  await m.react('🎴')
}

handler.help     = ['coleccion [página]']
handler.tags     = ['gacha']
handler.command  = ['coleccion', 'colección', 'mycollection', 'inventariogacha']
handler.register = true
handler.desc     = 'Ver tu colección de personajes gacha'

export default handler
