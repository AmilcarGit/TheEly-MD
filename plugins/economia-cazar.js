
const handler = async (m, { conn }) => {
    const user = global.db.data.users[m.sender]
    const moneda = global.moneda || '🌼 ElyCoins'

    // Cooldown de 45 segundos
    const cooldown = 45 * 1000
    const ultimaCaza = user.ultimaCaza || 0
    if (Date.now() - ultimaCaza < cooldown) {
        const tiempoRestante = Math.ceil((cooldown - (Date.now() - ultimaCaza)) / 1000)
        return m.reply(`⏳ *Espera ${tiempoRestante} segundos para cazar de nuevo*`)
    }

    // Posibles presas
    const presas = [
        { tipo: 'carne', nombre: '🍖 Carne de ciervo', monedas: 15, emoji: '🦌' },
        { tipo: 'carne', nombre: '🍗 Carne de conejo', monedas: 10, emoji: '🐇' },
        { tipo: 'piel', nombre: '🧥 Piel de zorro', monedas: 25, emoji: '🦊' },
        { tipo: 'piel', nombre: '🧣 Piel de lobo', monedas: 30, emoji: '🐺' },
        { tipo: 'tesoro', nombre: '🦷 Colmillo de jabalí', monedas: 40, emoji: '🐗' },
        { tipo: 'nada', nombre: '🍄 Setas venenosas', monedas: 0, emoji: '🍄' },
        { tipo: 'nada', nombre: '🌿 Plantas silvestres', monedas: 0, emoji: '🌿' }
    ]

    const presa = presas[Math.floor(Math.random() * presas.length)]
    user.ultimaCaza = Date.now()

    let mensaje = `╔══〔 *THEELY-MD — CAZAR* 〕══╗\n║\n║ 🏹 *Te adentras en el bosque...*\n║`

    if (presa.tipo === 'nada') {
        mensaje += `\n║ ${presa.emoji} *${presa.nombre}*\n║ 😅 *No cazaste nada útil*`
    } else {
        // Agregar al inventario
        if (!user.inventario) user.inventario = []
        user.inventario.push({
            id: presa.tipo,
            nombre: presa.nombre,
            fecha: Date.now()
        })

        // Bonus de monedas
        if (presa.monedas > 0) {
            user.coin = (user.coin || 0) + presa.monedas
        }

        mensaje += `\n║ ${presa.emoji} *${presa.nombre}*\n║ 💰 +${presa.monedas} ${moneda}`
    }

    mensaje += `\n║ 💵 Saldo: ${user.coin || 0} ${moneda}\n║\n╚══════════════════════════════════╝`

    await m.react('🏹')
    await m.reply(mensaje)
}

handler.help = ['cazar']
handler.tags = ['eco']
handler.command = ['cazar', 'hunt']
handler.register = true
handler.desc = 'Caza animales para obtener items y monedas'
export default handler