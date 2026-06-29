
const handler = async (m, { conn, args, usedPrefix }) => {
    const user = global.db.data.users[m.sender]
    const moneda = global.moneda || '🌼 ElyCoins'

    // CATÁLOGO DE ITEMS
    const items = {
        'espada': { nombre: '🗡️ Espada', precio: 500, desc: 'Ataque +10' },
        'escudo': { nombre: '🛡️ Escudo', precio: 400, desc: 'Defensa +8' },
        'pocion': { nombre: '🧪 Poción de vida', precio: 200, desc: 'Recupera 50 HP' },
        'varita': { nombre: '🔮 Varita mágica', precio: 1000, desc: 'Poder especial' },
        'pescado': { nombre: '🐟 Pescado fresco', precio: 50, desc: 'Se vende o se cocina' },
        'carne': { nombre: '🍖 Carne de caza', precio: 60, desc: 'Alimento básico' },
        'piel': { nombre: '🧥 Piel de animal', precio: 80, desc: 'Para confeccionar' }
    }

    // Si no hay args, mostrar tienda
    if (!args[0]) {
        let catalogo = Object.entries(items).map(([key, item]) => 
            `║ ${item.nombre}\n║   Precio: ${item.precio} ${moneda}\n║   ${item.desc}`
        ).join('\n║\n')

        return m.reply([
            `╔══〔 *THEELY-MD — TIENDA* 〕══╗`,
            `║`,
            `║ 📦 *Items disponibles:*`,
            `║`,
            catalogo,
            `║`,
            `║ *Uso:* ${usedPrefix}comprar <item>`,
            `║ Ejemplo: ${usedPrefix}comprar espada`,
            `║`,
            `╚══════════════════════════════════╝`
        ].join('\n'))
    }

    const itemKey = args[0].toLowerCase()
    const item = items[itemKey]
    if (!item) return m.reply(`❌ *Item no encontrado*\nUsa ${usedPrefix}comprar para ver la tienda`)

    if ((user.coin || 0) < item.precio) {
        return m.reply([
            `╔══〔 *THEELY-MD — COMPRAR* 〕══╗`,
            `║`,
            `║ ❌ *Saldo insuficiente~*`,
            `║ Tienes: ${user.coin || 0} ${moneda}`,
            `║ Necesitas: ${item.precio} ${moneda}`,
            `║`,
            `╚══════════════════════════════════╝`
        ].join('\n'))
    }

    // Restar monedas
    user.coin -= item.precio

    // Agregar al inventario
    if (!user.inventario) user.inventario = []
    user.inventario.push({
        id: itemKey,
        nombre: item.nombre,
        fecha: Date.now()
    })

    await m.react('✅')
    await m.reply([
        `╔══〔 *THEELY-MD — COMPRAR* 〕══╗`,
        `║`,
        `║ ✅ *Compra exitosa~*`,
        `║`,
        `║ 🛒 *${item.nombre}*`,
        `║ 💰 -${item.precio} ${moneda}`,
        `║ 💵 Saldo: ${user.coin} ${moneda}`,
        `║`,
        `╚══════════════════════════════════╝`
    ].join('\n'))
}

handler.help = ['comprar <item>']
handler.tags = ['eco']
handler.command = ['comprar', 'buy']
handler.register = true
handler.desc = 'Compra items en la tienda'
export default handler