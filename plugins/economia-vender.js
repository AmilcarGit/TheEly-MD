
const handler = async (m, { conn, args, usedPrefix }) => {
    const user = global.db.data.users[m.sender]
    const moneda = global.moneda || '🌼 ElyCoins'

    // PRECIOS DE VENTA (50% del precio de compra)
    const preciosVenta = {
        'espada': 250,
        'escudo': 200,
        'pocion': 100,
        'varita': 500,
        'pescado': 25,
        'carne': 30,
        'piel': 40
    }

    // Nombres para mostrar
    const nombres = {
        'espada': '🗡️ Espada',
        'escudo': '🛡️ Escudo',
        'pocion': '🧪 Poción de vida',
        'varita': '🔮 Varita mágica',
        'pescado': '🐟 Pescado fresco',
        'carne': '🍖 Carne de caza',
        'piel': '🧥 Piel de animal'
    }

    if (!args[0]) {
        return m.reply([
            `╔══〔 *THEELY-MD — VENDER* 〕══╗`,
            `║`,
            `║ 📤 *Vende tus items*`,
            `║`,
            `║ *Uso:* ${usedPrefix}vender <item>`,
            `║ Ejemplo: ${usedPrefix}vender pescado`,
            `║`,
            `║ 💰 *Precios de venta:*`,
            ...Object.entries(preciosVenta).map(([key, precio]) => 
                `║ ${nombres[key]}: ${precio} ${moneda}`
            ),
            `║`,
            `╚══════════════════════════════════╝`
        ].join('\n'))
    }

    const itemKey = args[0].toLowerCase()
    if (!preciosVenta[itemKey]) {
        return m.reply(`❌ *Item no válido*\nUsa ${usedPrefix}vender para ver los items vendibles`)
    }

    // Verificar si tiene el item en inventario
    if (!user.inventario || user.inventario.length === 0) {
        return m.reply('❌ *No tienes ningún item para vender*')
    }

    const index = user.inventario.findIndex(item => item.id === itemKey)
    if (index === -1) {
        return m.reply(`❌ *No tienes ${nombres[itemKey]} en tu inventario*`)
    }

    // Eliminar el item
    user.inventario.splice(index, 1)

    // Sumar monedas
    const ganancia = preciosVenta[itemKey]
    user.coin = (user.coin || 0) + ganancia

    await m.react('💰')
    await m.reply([
        `╔══〔 *THEELY-MD — VENDER* 〕══╗`,
        `║`,
        `║ ✅ *Venta exitosa~*`,
        `║`,
        `║ 📤 ${nombres[itemKey]}`,
        `║ 💰 +${ganancia} ${moneda}`,
        `║ 💵 Saldo: ${user.coin} ${moneda}`,
        `║`,
        `╚══════════════════════════════════╝`
    ].join('\n'))
}

handler.help = ['vender <item>']
handler.tags = ['eco']
handler.command = ['vender', 'sell']
handler.register = true
handler.desc = 'Vende items de tu inventario'
export default handler