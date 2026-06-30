const ITEMS = [
  // ── HERRAMIENTAS ──
  { id: 1,  nombre: 'Pico de Hierro',    emoji: '⛏️',  precio: 300,   categoria: 'herramienta', desc: 'Mejora tus ganancias al minar',           venta: 150  },
  { id: 2,  nombre: 'Pico de Oro',       emoji: '🥇',  precio: 800,   categoria: 'herramienta', desc: 'Mayor probabilidad de minerales raros',    venta: 400  },
  { id: 3,  nombre: 'Pico de Diamante',  emoji: '💎',  precio: 2000,  categoria: 'herramienta', desc: 'El mejor pico, máxima rareza garantizada',  venta: 1000 },
  { id: 4,  nombre: 'Caña de Pescar',    emoji: '🎣',  precio: 250,   categoria: 'herramienta', desc: 'Para pescar y ganar monedas extra',         venta: 120  },
  { id: 5,  nombre: 'Mochila',           emoji: '🎒',  precio: 600,   categoria: 'herramienta', desc: 'Aumenta tu capacidad de inventario',        venta: 300  },

  // ── PROTECCIÓN ──
  { id: 6,  nombre: 'Escudo Anti-Robo',  emoji: '🛡️',  precio: 500,   categoria: 'proteccion',  desc: 'Protege tus monedas por 24h',               venta: 250  },
  { id: 7,  nombre: 'Armadura',          emoji: '🪖',  precio: 1200,  categoria: 'proteccion',  desc: 'Protección total por 48h',                  venta: 600  },
  { id: 8,  nombre: 'Amuleto',           emoji: '📿',  precio: 700,   categoria: 'proteccion',  desc: 'Reduce multa si te atrapan robando',        venta: 350  },

  // ── SUERTE ──
  { id: 9,  nombre: 'Pocima de Suerte',  emoji: '🍀',  precio: 400,   categoria: 'suerte',      desc: 'Aumenta probabilidad en slots x2',          venta: 200  },
  { id: 10, nombre: 'Trébol Dorado',     emoji: '🌟',  precio: 900,   categoria: 'suerte',      desc: 'Triplica tus chances en apuestas',          venta: 450  },
  { id: 11, nombre: 'Dado de Cristal',   emoji: '🎲',  precio: 650,   categoria: 'suerte',      desc: 'Lanza dados con ventaja',                   venta: 325  },

  // ── PREMIUM ──
  { id: 12, nombre: 'VIP 1 día',      emoji: '👑',  precio: 1000,  categoria: 'premium', desc: 'Activa premium por 24 horas', venta: 0, duracion: 1  * 24 * 60 * 60 * 1000 },
  { id: 13, nombre: 'VIP 3 días',     emoji: '💛',  precio: 2500,  categoria: 'premium', desc: 'Activa premium por 3 días',   venta: 0, duracion: 3  * 24 * 60 * 60 * 1000 },
  { id: 14, nombre: 'VIP 7 días',     emoji: '💜',  precio: 5000,  categoria: 'premium', desc: 'Activa premium por 7 días',   venta: 0, duracion: 7  * 24 * 60 * 60 * 1000 },
  { id: 15, nombre: 'VIP 15 días',    emoji: '💙',  precio: 9000,  categoria: 'premium', desc: 'Activa premium por 15 días',  venta: 0, duracion: 15 * 24 * 60 * 60 * 1000 },
  { id: 16, nombre: 'VIP 30 días',    emoji: '💎',  precio: 15000, categoria: 'premium', desc: 'Activa premium por 30 días',  venta: 0, duracion: 30 * 24 * 60 * 60 * 1000 },
  { id: 17, nombre: 'VIP Permanente', emoji: '🌼',  precio: 50000, categoria: 'premium', desc: 'Premium de por vida',         venta: 0, duracion: 0 },
  { id: 18, nombre: 'Boost de EXP',   emoji: '⭐',  precio: 800,   categoria: 'premium', desc: 'Duplica tu EXP por 24h',     venta: 400, duracion: 24 * 60 * 60 * 1000 },

  // ── ESPECIALES ──
  { id: 19, nombre: 'Cofre Misterioso',  emoji: '🎁',  precio: 1500,  categoria: 'especial',    desc: 'Contiene un item aleatorio',                venta: 0    },
  { id: 20, nombre: 'Cristal Ely',       emoji: '🌼',  precio: 3000,  categoria: 'especial',    desc: 'Item legendario de TheEly-MD',              venta: 1500 },
  { id: 21, nombre: 'Llave del Banco',   emoji: '🔑',  precio: 2500,  categoria: 'especial',    desc: 'Aumenta el límite del banco x2',            venta: 1200 },
  { id: 22, nombre: 'Mascota Ely',       emoji: '🐾',  precio: 4000,  categoria: 'especial',    desc: 'Mascota que genera monedas pasivas',        venta: 2000 },

  // ── CONSUMIBLES ──
  { id: 23, nombre: 'Poción de Salud',   emoji: '🧪',  precio: 150,   categoria: 'consumible',  desc: 'Restaura tu salud al máximo',               venta: 75   },
  { id: 24, nombre: 'Energizante',       emoji: '⚡',  precio: 200,   categoria: 'consumible',  desc: 'Reduce cooldown de trabajo a la mitad',     venta: 100  },
  { id: 25, nombre: 'Mapa del Tesoro',   emoji: '🗺️',  precio: 500,   categoria: 'consumible',  desc: 'Revela ubicación de cofre extra',           venta: 250  },
  { id: 26, nombre: 'Billete Dorado',    emoji: '💵',  precio: 100,   categoria: 'consumible',  desc: 'Vale 200 monedas al usarlo',                venta: 50   },
]

const CATEGORIAS = {
  herramienta: '⛏️ Herramientas',
  proteccion:  '🛡️ Protección',
  suerte:      '🍀 Suerte',
  premium:     '👑 Premium',
  especial:    '🌼 Especiales',
  consumible:  '🧪 Consumibles',
}

function tiempoRestante(ms) {
  const h   = Math.floor(ms / 3600000)
  const min = Math.floor((ms % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  return `${h}h ${min}m`
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const user    = global.db.data.users[m.sender]
  const moneda  = global.moneda || 'coins'
  const opcion  = parseInt(args[0])
  const filtro  = (args[0] || '').toLowerCase()

  // ── Verificar premium vencido ──
  if (user.premium && user.premiumTime && Date.now() > user.premiumTime) {
    global.db.data.users[m.sender].premium     = false
    global.db.data.users[m.sender].premiumTime = 0
    await global.db.write()
  }

  // ── VER TIENDA ──
  if (!args[0] || isNaN(opcion)) {
    const categoriaFiltro = Object.keys(CATEGORIAS).find(c => c === filtro)

    if (categoriaFiltro) {
      const itemsFiltrados = ITEMS.filter(i => i.categoria === categoriaFiltro)
      const lista = itemsFiltrados.map(i =>
        `║ ${i.emoji} *[${i.id}] ${i.nombre}*\n║    💰 ${i.precio} ${moneda} | 🔄 Venta: ${i.venta > 0 ? i.venta : 'No vendible'}\n║    📝 ${i.desc}`
      ).join('\n║\n')

      return m.reply([
        `╔══〔 🌼 *THEELY-MD — ${CATEGORIAS[categoriaFiltro]}* 〕══╗`,
        `║`,
        lista,
        `║`,
        `║ 💡 *Comprar:* ${usedPrefix}tienda <número>`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n'))
    }

    const categoriasTexto = Object.entries(CATEGORIAS).map(([k, v]) =>
      `║ ${v} → ${usedPrefix}tienda ${k}`
    ).join('\n')

    const premiumStatus = user.premium && user.premiumTime
      ? `💎 Activo — vence en ${tiempoRestante(user.premiumTime - Date.now())}`
      : '❌ Sin premium'

    return m.reply([
      `╔══〔 🌼 *THEELY-MD — TIENDA* 〕══╗`,
      `║`,
      `║ 🛒 *${ITEMS.length} items disponibles*`,
      `║ 👛 *Tu saldo:* ${user.coin || 0} ${moneda}`,
      `║ 👑 *Premium:*  ${premiumStatus}`,
      `║`,
      `╠══〔 📂 *CATEGORÍAS* 〕═══════════╣`,
      `║`,
      categoriasTexto,
      `║`,
      `║ 💡 *Ver todo:* ${usedPrefix}tienda all`,
      `║ 💡 *Comprar:*  ${usedPrefix}tienda <número>`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  // ── VER TODO ──
  if (filtro === 'all') {
    const porCategoria = Object.entries(CATEGORIAS).map(([cat, titulo]) => {
      const items = ITEMS.filter(i => i.categoria === cat)
      const lista = items.map(i => `║ ${i.emoji} *[${i.id}]* ${i.nombre} — ${i.precio} ${moneda}`).join('\n')
      return `╠══〔 ${titulo} 〕═══╣\n${lista}`
    }).join('\n║\n')

    return m.reply([
      `╔══〔 🌼 *THEELY-MD — TIENDA COMPLETA* 〕══╗`,
      `║`,
      porCategoria,
      `║`,
      `║ 💡 *Comprar:* ${usedPrefix}tienda <número>`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  // ── COMPRAR ──
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

  // ── Descontar monedas ──
  global.db.data.users[m.sender].coin -= item.precio

  // ── Activar premium/boost automáticamente ──
  let mensajeExtra = ''

  if (item.categoria === 'premium') {
    if (item.id >= 12 && item.id <= 17) {
      // VIP — activa premium (id 17 = permanente, duracion 0)
      global.db.data.users[m.sender].premium = true

      if (item.id === 17) {
        // VIP Permanente
        global.db.data.users[m.sender].premiumTime = 0
        mensajeExtra = `║ 🌼 *¡Premium PERMANENTE activado!*\n║ 👑 Nunca expira~`
      } else {
        const yaActivo     = global.db.data.users[m.sender].premiumTime > Date.now()
        const tiempoActual = yaActivo ? global.db.data.users[m.sender].premiumTime : Date.now()

        global.db.data.users[m.sender].premiumTime = tiempoActual + item.duracion

        const vence = new Date(global.db.data.users[m.sender].premiumTime)
          .toLocaleString('es', { timeZone: 'America/Lima' })

        mensajeExtra = `║ 👑 *Premium activado~*\n║ ⏰ Vence: ${vence}`
      }

    } else if (item.id === 18) {
      // Boost EXP
      global.db.data.users[m.sender].boostExp     = true
      global.db.data.users[m.sender].boostExpTime = Date.now() + item.duracion
      mensajeExtra = `║ ⭐ *Boost de EXP activado por 24h~*`
    }
  }

  // ── Guardar en inventario ──
  if (!global.db.data.users[m.sender].inventario) global.db.data.users[m.sender].inventario = []
  if (item.venta > 0 || item.categoria !== 'premium') {
    global.db.data.users[m.sender].inventario.push({
      id: item.id, nombre: item.nombre, emoji: item.emoji, fecha: Date.now()
    })
  }

  await global.db.write()

  await m.react('🛒')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — TIENDA* 〕══╗`,
    `║`,
    `║ ✅ *¡Compra exitosa!*`,
    `║`,
    `║ ${item.emoji} *${item.nombre}*`,
    `║ 📂 *Categoría:* ${CATEGORIAS[item.categoria]}`,
    `║ 💰 *-${item.precio}* ${moneda}`,
    `║ 👛 *Saldo:* ${global.db.data.users[m.sender].coin} ${moneda}`,
    mensajeExtra ? `║` : '',
    mensajeExtra || '',
    `║`,
    `╚══════════════════════════════════╝`
  ].filter(Boolean).join('\n'))
}

handler.help     = ['tienda [categoría/número]']
handler.tags     = ['eco']
handler.command  = ['tienda', 'shop', 'store']
handler.register = true
handler.desc     = 'Tienda de items del bot'
export default handler
