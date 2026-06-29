const ITEMS_VENTA = {
  1:  { nombre: 'Pico de Hierro',    emoji: '⛏️',  precio: 150  },
  2:  { nombre: 'Pico de Oro',       emoji: '🥇',  precio: 400  },
  3:  { nombre: 'Pico de Diamante',  emoji: '💎',  precio: 1000 },
  4:  { nombre: 'Caña de Pescar',    emoji: '🎣',  precio: 120  },
  5:  { nombre: 'Mochila',           emoji: '🎒',  precio: 300  },
  6:  { nombre: 'Escudo Anti-Robo',  emoji: '🛡️',  precio: 250  },
  7:  { nombre: 'Armadura',          emoji: '🪖',  precio: 600  },
  8:  { nombre: 'Amuleto',           emoji: '📿',  precio: 350  },
  9:  { nombre: 'Pocima de Suerte',  emoji: '🍀',  precio: 200  },
  10: { nombre: 'Trébol Dorado',     emoji: '🌟',  precio: 450  },
  11: { nombre: 'Dado de Cristal',   emoji: '🎲',  precio: 325  },
  14: { nombre: 'Boost de EXP',      emoji: '⭐',  precio: 400  },
  16: { nombre: 'Cristal Ely',       emoji: '🌼',  precio: 1500 },
  17: { nombre: 'Llave del Banco',   emoji: '🔑',  precio: 1200 },
  18: { nombre: 'Mascota Ely',       emoji: '🐾',  precio: 2000 },
  19: { nombre: 'Poción de Salud',   emoji: '🧪',  precio: 75   },
  20: { nombre: 'Energizante',       emoji: '⚡',  precio: 100  },
  21: { nombre: 'Mapa del Tesoro',   emoji: '🗺️',  precio: 250  },
  22: { nombre: 'Billete Dorado',    emoji: '💵',  precio: 50   },
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const user   = global.db.data.users[m.sender]
  const moneda = global.moneda || 'coins'
  const idItem = parseInt(args[0])
  const cantidad = parseInt(args[1]) || 1

  if (!idItem) return m.reply([
    `╔══〔 🌼 *THEELY-MD — VENDER* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <id> [cantidad]`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} 1`,
    `║ ${usedPrefix + command} 1 3`,
    `║`,
    `║ 💡 Usa *.inventario* para ver`,
    `║ tus items y sus IDs~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const inventario = user.inventario || []

  if (inventario.length === 0) return m.reply([
    `╔══〔 🌼 *THEELY-MD — VENDER* 〕══╗`,
    `║`,
    `║ ❌ *Tu inventario está vacío~*`,
    `║ Visita la *.tienda* primero~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const itemInfo = ITEMS_VENTA[idItem]
  if (!itemInfo) return m.reply([
    `╔══〔 🌼 *THEELY-MD — VENDER* 〕══╗`,
    `║`,
    `║ ❌ *Este item no se puede vender~*`,
    `║ Los items VIP y cofres no tienen`,
    `║ valor de reventa~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  const itemsDisponibles = inventario.filter(i => i.id === idItem)

  if (itemsDisponibles.length === 0) return m.reply([
    `╔══〔 🌼 *THEELY-MD — VENDER* 〕══╗`,
    `║`,
    `║ ❌ *No tienes ese item~*`,
    `║ Usa *.inventario* para ver`,
    `║ lo que tienes~`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  if (itemsDisponibles.length < cantidad) return m.reply([
    `╔══〔 🌼 *THEELY-MD — VENDER* 〕══╗`,
    `║`,
    `║ ❌ *No tienes suficientes~*`,
    `║ ${itemInfo.emoji} Tienes: x${itemsDisponibles.length}`,
    `║ Quieres vender: x${cantidad}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  let vendidos = 0
  user.inventario = inventario.filter(i => {
    if (i.id === idItem && vendidos < cantidad) {
      vendidos++
      return false
    }
    return true
  })

  const ganancia = itemInfo.precio * cantidad
  user.coin = (user.coin || 0) + ganancia

  await m.react('💸')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — VENDER* 〕══╗`,
    `║`,
    `║ ✅ *¡Venta exitosa!*`,
    `║`,
    `║ ${itemInfo.emoji} *${itemInfo.nombre}* x${cantidad}`,
    `║ 💰 *+${ganancia}* ${moneda}`,
    `║`,
    `║ 👛 *Saldo:* ${user.coin} ${moneda}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help     = ['vender <id> [cantidad]']
handler.tags     = ['eco']
handler.command  = ['vender', 'sell', 'venta']
handler.register = true
handler.desc     = 'Vende items de tu inventario'
export default handler
