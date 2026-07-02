const handler = async (m, { conn, args }) => {
  if (args.length < 2) {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — RESTA* 〕══╗`,
      `║`,
      `║  📝 *Resta dos o más números*`,
      `║`,
      `║  💡 *Uso:* .restar <n1> <n2> <n3...>`,
      `║  📌 *Ejemplo:* .restar 20 5 3`,
      `║  🟢 *Resultado:* 12`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const numeros = args.map(Number)
  if (numeros.some(isNaN)) return m.reply('❌ *Todos los valores deben ser números*')

  const total = numeros.reduce((a, b) => a - b)
  const operacion = numeros.join(' - ')

  await m.react('➖')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — RESTA* 〕══╗`,
    `║`,
    `║  📝 *Operación:*`,
    `║  ${operacion} = ${total}`,
    `║`,
    `║  ✅ *Resultado:* ${total}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help = ['restar <n1> <n2> ...']
handler.tags = ['estudio']
handler.command = ['restar', 'resta', '-']
handler.register = false
handler.desc = 'Resta dos o más números'
export default handler