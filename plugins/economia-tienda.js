const ITEMS = [
  { id: 1, nombre: 'Pico de Hierro',   emoji: '⛏️',  precio: 300,  desc: 'Mejora tus ganancias al minar' },
  { id: 2, nombre: 'Pico de Oro',      emoji: '🥇',  precio: 800,  desc: 'Mayor probabilidad de minerales raros' },
  { id: 3, nombre: 'Escudo Anti-Robo', emoji: '🛡️',  precio: 500,  desc: 'Protege tus monedas por 24h' },
  { id: 4, nombre: 'Pocima de Suerte', emoji: '🍀',  precio: 400,  desc: 'Aumenta probabilidad en slots' },
  { id: 5, nombre: 'VIP 1 día',        emoji: '💎',  precio: 1000, desc: 'Acceso premium por 24 horas' },
]

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const opcion = parseInt(args[0])

  if (!opcion) {
    const lista = ITEMS.map(i =>
      `║ ${i.emoji} *[${i.id}] ${i.nombre}*\n║    💰 ${i.precio} ${moneda}\n║    📝 ${i.desc}`
    ).join('\n║\n')

    return m.reply([
      `╔══〔 🌼 *THEELY-MD — TIENDA* 〕══╗`,
      `║`,
      lista,
      `║`,
      `║ 💡 *Comprar:* ${usedPrefix}tienda <número>`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const item = ITEMS.find(i => i.id === opcion)
  if (!item) return m.reply([
    `╔══〔 🌼 *THEELY-MD — TIENDA* 〕══╗`,
    `║`,
    `║ ❌ *Item no encontrado~*`,
    `║ Usa *.tienda* para ver la lista`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if ((user.coin || 0) < item.precio) return m.reply([
    `╔══〔 🌼 *THEELY-MD — TIENDA* 〕══╗`,
    `║`,
    `║ ❌ *Saldo insuficiente~*`,
    `║ 💰 Precio: ${item.precio} ${moneda}`,
    `║ 👛 Tienes: ${user.coin || 0} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  user.coin -= item.precio
  if (!user.inventario) user.inventario = []
  user.inventario.push({ id: item.id, nombre: item.nombre, fecha: Date.now() })

  await m.react('🛒')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — TIENDA* 〕══╗`,
    `║`,
    `║ ✅ *¡Compra exitosa!*`,
    `║`,
    `║ ${item.emoji} *${item.nombre}*`,
    `║ 💰 *-${item.precio}* ${moneda}`,
    `║`,
    `║ 👛 *Saldo:* ${user.coin} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help     = ['tienda [número]']
handler.tags     = ['eco']
handler.command  = ['tienda', 'shop', 'store']
handler.register = true
handler.desc     = 'Tienda de items del bot'
export default handler
